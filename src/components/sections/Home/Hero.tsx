"use client";

import BackdropCard from "@/components/sections/Home/Cards/Backdrop";
import { tmdb } from "@/api/tmdb";
import { getImageUrl, mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { Button, Skeleton } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HiChevronLeft, HiChevronRight, HiInformationCircle, HiPlay } from "react-icons/hi2";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Saira } from "@/utils/fonts";
import { Movie, TV } from "tmdb-ts/dist/types";

const Hero: React.FC = () => {
  const [content] = useQueryState(
    "content",
    parseAsStringLiteral(["movie", "tv"]).withDefault("movie"),
  );
  const [index, setIndex] = useState(0);

  const { data, isPending, isError } = useQuery({
    queryKey: ["home-hero", content],
    queryFn: () => tmdb.trending.trending(content, "week"),
    staleTime: 1000 * 60 * 10,
  });

  const heroItems = useMemo(() => (data?.results ?? []).filter((item) => item.backdrop_path).slice(0, 8), [data]);

  useEffect(() => setIndex(0), [content]);

  useEffect(() => {
    if (heroItems.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % heroItems.length), 9000);
    return () => window.clearInterval(timer);
  }, [heroItems.length, content]);

  if (isPending) return <Skeleton className="h-[700px] w-full rounded-none md:h-[760px]" />;

  if (isError || !heroItems.length) {
    return (
      <section className="flex min-h-[560px] items-center justify-center bg-black px-6 text-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Spacely</p>
          <h1 className="mt-3 text-3xl font-black text-white">Trending content is unavailable.</h1>
          <p className="mt-2 text-sm text-white/45">Refresh the page and try again.</p>
        </div>
      </section>
    );
  }

  const media = heroItems[index] ?? heroItems[0];
  const isMovie = "title" in media;
  const title = isMovie ? mutateMovieTitle(media as Movie) : mutateTvShowTitle(media as TV);
  const year = isMovie ? media.release_date?.slice(0, 4) || "—" : media.first_air_date?.slice(0, 4) || "—";
  const backdrop = getImageUrl(media.backdrop_path, "backdrop", true);
  const detailHref = isMovie ? `/movie/${media.id}` : `/tv/${media.id}`;

  const move = (direction: number) => {
    setIndex((current) => (current + direction + heroItems.length) % heroItems.length);
  };

  return (
    <section className="relative -mx-3 min-h-[700px] overflow-hidden bg-black md:min-h-[760px] md:-mx-6 lg:-mx-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={media.id}
          initial={{ opacity: 0, scale: 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.99) 0%, rgba(0,0,0,.88) 24%, rgba(0,0,0,.42) 56%, rgba(0,0,0,.16) 100%), linear-gradient(0deg, #000 4%, rgba(0,0,0,.78) 22%, rgba(0,0,0,0) 62%), url(${backdrop})`,
            backgroundPosition: "center top",
            backgroundSize: "cover",
          }}
        />
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black via-black/80 to-transparent" />

      <div className="relative z-10 flex min-h-[700px] items-start px-6 pb-[285px] pt-36 md:min-h-[760px] md:px-12 md:pb-[300px] md:pt-44 lg:px-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={media.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="max-w-[680px]"
          >
            <div className="mb-5 flex flex-wrap items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 md:text-xs">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-white backdrop-blur-xl">
                {content === "movie" ? "Trending Movies" : "Trending TV"}
              </span>
              <span>{year}</span>
              <span className="text-white/30">•</span>
              <span>{media.vote_average.toFixed(1)} Rating</span>
            </div>

            <h1 className={`${Saira.className} max-w-[700px] text-[3.8rem] font-black uppercase leading-[0.88] tracking-[-0.045em] text-white drop-shadow-2xl sm:text-6xl md:text-8xl lg:text-[7rem]`}>
              {title}
            </h1>

            <p className="mt-6 line-clamp-3 max-w-[590px] text-sm font-medium leading-6 text-white/65 md:text-base md:leading-7">
              {media.overview || "Discover something worth watching tonight."}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                as={Link}
                href={isMovie ? `/movie/${media.id}/player` : detailHref}
                size="lg"
                radius="full"
                startContent={<HiPlay className="size-5 fill-current" />}
                className="h-12 bg-white px-7 text-sm font-extrabold text-black shadow-2xl shadow-black/40 transition-transform hover:scale-[1.03] md:text-base"
              >
                {isMovie ? "Play" : "Explore"}
              </Button>
              <Button
                as={Link}
                href={detailHref}
                size="lg"
                radius="full"
                variant="flat"
                startContent={<HiInformationCircle className="size-5" />}
                className="h-12 border border-white/15 bg-white/10 px-7 text-sm font-bold text-white backdrop-blur-xl hover:bg-white/15 md:text-base"
              >
                More Info
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-0 bottom-6 z-20 px-6 md:bottom-7 md:px-12 lg:px-20">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_currentColor]" />
              <h2 className="text-lg font-extrabold text-white md:text-xl">Trending Now</h2>
            </div>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/35 md:text-[10px]">
              Updated weekly · {content === "movie" ? "Movies" : "TV Series"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => move(-1)} aria-label="Previous featured title" className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-white backdrop-blur-xl transition hover:bg-white/15">
              <HiChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => move(1)} aria-label="Next featured title" className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-white backdrop-blur-xl transition hover:bg-white/15">
              <HiChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="mb-3 flex gap-1.5">
          {heroItems.map((item, itemIndex) => (
            <button key={item.id} type="button" aria-label={`Show featured title ${itemIndex + 1}`} aria-current={itemIndex === index ? "true" : undefined} onClick={() => setIndex(itemIndex)} className={`h-1 rounded-full transition-all duration-300 ${itemIndex === index ? "w-9 bg-white" : "w-2 bg-white/25 hover:bg-white/55"}`} />
          ))}
        </div>

        <div className="flex gap-3 overflow-hidden md:gap-4">
          {heroItems.slice(0, 5).map((item) => (
            <div key={item.id} className="w-[78%] shrink-0 sm:w-[48%] lg:w-[31%] xl:w-[24%]">
              <BackdropCard media={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
