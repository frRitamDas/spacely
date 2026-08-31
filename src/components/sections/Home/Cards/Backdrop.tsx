"use client";

import Rating from "@/components/ui/other/Rating";
import { getImageUrl, mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { Image } from "@heroui/react";
import Link from "next/link";
import { Movie, TV } from "tmdb-ts/dist/types";
import { HiPlay } from "react-icons/hi2";

interface BackdropCardProps {
  media: Movie | TV;
}

const BackdropCard: React.FC<BackdropCardProps> = ({ media }) => {
  const isMovie = "title" in media;
  const title = isMovie ? mutateMovieTitle(media as Movie) : mutateTvShowTitle(media as TV);
  const year = isMovie
    ? media.release_date?.slice(0, 4) || "—"
    : media.first_air_date?.slice(0, 4) || "—";
  const href = isMovie ? `/movie/${media.id}` : `/tv/${media.id}`;

  return (
    <Link href={href} className="group block w-full">
      <article className="relative aspect-[16/8.8] min-h-[150px] w-full overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.04] shadow-xl shadow-black/30 transition duration-300 group-hover:-translate-y-1 group-hover:border-white/20 group-hover:shadow-2xl">
        <Image
          removeWrapper
          alt={title}
          src={getImageUrl(media.backdrop_path, "backdrop", true)}
          radius="none"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 md:p-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-extrabold text-white md:text-base">{title}</h3>
            <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-white/60 md:text-xs">
              <span>{year}</span>
              <span>•</span>
              <Rating rate={media.vote_average || 0} />
            </div>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-xl transition duration-300 group-hover:opacity-100 md:size-10">
            <HiPlay className="size-4 fill-current md:size-5" />
          </span>
        </div>
      </article>
    </Link>
  );
};

export default BackdropCard;
