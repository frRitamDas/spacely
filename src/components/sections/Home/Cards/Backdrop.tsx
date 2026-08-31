"use client";

import Rating from "@/components/ui/other/Rating";
import { getImageUrl, mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import useSpacelySettings from "@/hooks/useSpacelySettings";
import { env } from "@/utils/env";
import { Image } from "@heroui/react";
import Link from "next/link";
import { Movie, TV } from "tmdb-ts/dist/types";
import { useEffect, useState } from "react";
import { HiPlay } from "react-icons/hi2";

interface BackdropCardProps { media: Movie | TV; }

const BackdropCard: React.FC<BackdropCardProps> = ({ media }) => {
  const settings = useSpacelySettings();
  const [hovered, setHovered] = useState(false);
  const [trailer, setTrailer] = useState<string | null>(null);
  const isMovie = "title" in media;
  const title = isMovie ? mutateMovieTitle(media as Movie) : mutateTvShowTitle(media as TV);
  const year = isMovie ? media.release_date?.slice(0, 4) || "—" : media.first_air_date?.slice(0, 4) || "—";
  const href = isMovie ? `/movie/${media.id}` : `/tv/${media.id}`;

  useEffect(() => {
    if (!hovered || !settings.cardTrailers || trailer) return;
    const timer = window.setTimeout(async () => {
      try {
        const type = isMovie ? "movie" : "tv";
        const response = await fetch(`https://api.themoviedb.org/3/${type}/${media.id}/videos?language=en-US`, { headers: { Authorization: `Bearer ${env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`, accept: "application/json" }, cache: "force-cache" });
        const json = await response.json();
        const videos = Array.isArray(json?.results) ? json.results : [];
        const found = videos.find((video: any) => video.site === "YouTube" && video.type === "Trailer" && video.official) ?? videos.find((video: any) => video.site === "YouTube" && video.type === "Trailer");
        if (found?.key) setTrailer(found.key);
      } catch { /* poster remains the fallback */ }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [hovered, settings.cardTrailers, trailer, media.id, isMovie]);

  return <Link href={href} className="group block w-full" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocus={() => setHovered(true)} onBlur={() => setHovered(false)}>
    <article className="relative aspect-[16/8.8] min-h-[150px] w-full overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.04] shadow-xl shadow-black/30 transition duration-300 group-hover:-translate-y-1 group-hover:border-white/20 group-hover:shadow-2xl">
      <Image removeWrapper alt={title} src={getImageUrl(media.backdrop_path, "backdrop", true)} radius="none" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      {settings.cardTrailers && hovered && trailer && <iframe title={`${title} trailer preview`} src={`https://www.youtube-nocookie.com/embed/${trailer}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer}&modestbranding=1&rel=0&playsinline=1`} allow="autoplay; encrypted-media" className="pointer-events-none absolute inset-0 z-[1] h-full w-full scale-[1.04]" />}
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-[3] flex items-end justify-between gap-3 p-3 md:p-4"><div className="min-w-0"><h3 className="truncate text-sm font-extrabold text-white md:text-base">{title}</h3><div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-white/60 md:text-xs"><span>{year}</span><span>•</span><Rating rate={media.vote_average || 0} /></div></div><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-xl transition duration-300 group-hover:opacity-100 md:size-10"><HiPlay className="size-4 fill-current md:size-5" /></span></div>
    </article>
  </Link>;
};

export default BackdropCard;
