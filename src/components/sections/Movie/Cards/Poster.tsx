import Rating from "@/components/ui/other/Rating";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDeviceVibration from "@/hooks/useDeviceVibration";
import { getImageUrl, mutateMovieTitle } from "@/utils/movies";
import { Card, CardBody, CardFooter, CardHeader, Chip, Image, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDisclosure, useHover } from "@mantine/hooks";
import Link from "next/link";
import { useCallback } from "react";
import { Movie } from "tmdb-ts/dist/types";
import { useLongPress } from "use-long-press";
import HoverPosterCard from "./Hover";

interface MoviePosterCardProps {
  movie: Movie;
  variant?: "full" | "bordered";
}

const MoviePosterCard: React.FC<MoviePosterCardProps> = ({ movie, variant = "full" }) => {
  const { hovered, ref } = useHover();
  const [opened, handlers] = useDisclosure(false);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "—";
  const posterImage = getImageUrl(movie.poster_path);
  const title = mutateMovieTitle(movie);
  const { mobile } = useBreakpoints();
  const { startVibration } = useDeviceVibration();

  const callback = useCallback(() => {
    handlers.open();
    setTimeout(() => startVibration([100]), 300);
  }, [handlers, startVibration]);

  const longPress = useLongPress(mobile ? callback : null, {
    cancelOnMovement: true,
    threshold: 300,
  });

  return (
    <>
      <Tooltip
        isDisabled={mobile}
        showArrow
        className="bg-secondary-background p-0"
        shadow="lg"
        delay={700}
        placement="right-start"
        content={<HoverPosterCard id={movie.id} />}
      >
        <Link href={`/movie/${movie.id}`} ref={ref} {...longPress()} className="block">
          {variant === "full" && (
            <div className="group relative aspect-2/3 overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-white shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/10">
              <div className="absolute inset-0 z-10 bg-linear-to-t from-black/95 via-black/10 to-transparent" />

              {hovered && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                  <span className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-white/15 shadow-2xl backdrop-blur-xl">
                    <Icon icon="line-md:play-filled" width="28" height="28" />
                  </span>
                </div>
              )}

              <div className="absolute left-2 top-2 z-20 flex gap-1.5">
                {movie.adult && (
                  <Chip color="danger" size="sm" variant="shadow" className="font-semibold">
                    18+
                  </Chip>
                )}
                {movie.vote_average >= 8 && (
                  <Chip size="sm" variant="flat" className="border border-white/10 bg-black/50 text-white backdrop-blur-md">
                    Top rated
                  </Chip>
                )}
              </div>

              <div className="absolute bottom-0 z-20 flex w-full flex-col gap-1 px-3 pb-3 pt-10 md:px-4 md:pb-4">
                <h6 className="truncate text-sm font-bold md:text-base">{title}</h6>
                <div className="flex items-center justify-between gap-2 text-xs text-white/65">
                  <p>{releaseYear}</p>
                  <Rating rate={movie.vote_average} />
                </div>
              </div>

              <Image
                alt={title}
                src={posterImage}
                radius="none"
                className="z-0 aspect-2/3 h-[250px] object-cover object-center transition duration-500 group-hover:scale-110 md:h-[300px]"
                classNames={{ img: "transition duration-500 group-hover:opacity-75" }}
              />
            </div>
          )}

          {variant === "bordered" && (
            <Card
              isHoverable
              fullWidth
              shadow="md"
              className="group h-full overflow-hidden border border-white/10 bg-white/[0.03]"
            >
              <CardHeader className="flex items-center justify-center pb-0">
                <div className="relative size-full overflow-hidden rounded-xl">
                  {hovered && (
                    <Icon icon="line-md:play-filled" width="56" height="56" className="absolute-center z-20 text-white" />
                  )}
                  {movie.adult && (
                    <Chip color="danger" size="sm" variant="shadow" className="absolute left-2 top-2 z-20">
                      18+
                    </Chip>
                  )}
                  <Image
                    isBlurred
                    alt={title}
                    className="aspect-2/3 rounded-xl object-cover object-center transition duration-500 group-hover:scale-105"
                    src={posterImage}
                  />
                </div>
              </CardHeader>
              <CardBody className="justify-end pb-1">
                <p className="truncate text-md font-bold">{title}</p>
              </CardBody>
              <CardFooter className="justify-between pt-0 text-xs text-foreground-500">
                <p>{releaseYear}</p>
                <Rating rate={movie.vote_average} />
              </CardFooter>
            </Card>
          )}
        </Link>
      </Tooltip>

      {mobile && (
        <VaulDrawer
          backdrop="blur"
          open={opened}
          onOpenChange={handlers.toggle}
          title={title}
          hiddenTitle
        >
          <HoverPosterCard id={movie.id} fullWidth />
        </VaulDrawer>
      )}
    </>
  );
};

export default MoviePosterCard;
