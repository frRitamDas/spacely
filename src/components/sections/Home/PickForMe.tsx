"use client";

import { tmdb } from "@/api/tmdb";
import { getImageUrl, mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { Button, Image } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { HiArrowPath, HiSparkles, HiPlay } from "react-icons/hi2";
import { Movie, TV } from "tmdb-ts/dist/types";

const PickForMe: React.FC = () => {
  const [pick, setPick] = useState<Movie | TV | null>(null);
  const { data, isPending } = useQuery({
    queryKey: ["spacely-pick-for-me"],
    queryFn: async () => {
      const [movies, tv] = await Promise.all([tmdb.trending.trending("movie", "week"), tmdb.trending.trending("tv", "week")]);
      return [...movies.results, ...tv.results].filter((item) => item.poster_path) as Array<Movie | TV>;
    },
    staleTime: 1000 * 60 * 30,
  });

  const choose = () => { if (data?.length) setPick(data[Math.floor(Math.random() * data.length)]); };
  const title = pick ? ("title" in pick ? mutateMovieTitle(pick) : mutateTvShowTitle(pick)) : "Not sure what to watch?";
  const href = pick ? `/${"title" in pick ? "movie" : "tv"}/${pick.id}` : "#";

  return <section className="mx-1 overflow-hidden rounded-[28px] border border-white/[0.09] bg-white/[0.035] shadow-[0_24px_80px_rgba(0,0,0,.22)] sm:mx-0">
    <div className="grid min-h-44 items-center gap-5 p-5 sm:grid-cols-[auto_1fr_auto] sm:p-6">
      <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-white/80"><HiSparkles className="size-5" /></div>
      <div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/30">Spacely picker</p><h2 className="mt-1 truncate text-xl font-black tracking-tight text-white sm:text-2xl">{title}</h2><p className="mt-1 text-xs leading-5 text-white/40">A quick choice from what is trending this week.</p></div>
      <div className="flex items-center gap-2 sm:justify-end">{pick && <Link href={href} aria-label="Open pick" className="flex size-10 items-center justify-center rounded-full bg-white text-black"><HiPlay className="size-4 fill-current" /></Link>}<Button isLoading={isPending} radius="full" onPress={choose} startContent={<HiArrowPath className="size-4" />} className="h-10 bg-white/[0.08] px-4 text-xs font-bold text-white hover:bg-white/[0.13]">Pick for me</Button></div>
      {pick && <div className="hidden overflow-hidden rounded-2xl border border-white/10 sm:block"><Image removeWrapper src={getImageUrl(pick.poster_path, "poster")} alt={title} className="h-24 w-16 object-cover" /></div>}
    </div>
  </section>;
};

export default PickForMe;
