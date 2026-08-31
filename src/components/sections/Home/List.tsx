"use client";

import { siteConfig } from "@/config/site";
import { Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PickForMe from "./PickForMe";

const MovieHomeList = dynamic(() => import("@/components/sections/Movie/HomeList"));
const TvShowHomeList = dynamic(() => import("@/components/sections/TV/HomeList"));

const HomePageList: React.FC = () => {
  const params = useSearchParams();
  const content = params.get("content");
  const movieLists = content === "tv" ? [] : content === "movie" ? siteConfig.queryLists.movies : siteConfig.queryLists.movies.slice(0, 4);
  const tvLists = content === "movie" ? [] : content === "tv" ? siteConfig.queryLists.tvShows : siteConfig.queryLists.tvShows.slice(0, 4);

  return <div className="flex flex-col gap-10 md:gap-14">
    {!content && <PickForMe />}
    <Suspense fallback={<div className="flex min-h-40 items-center justify-center"><Spinner size="lg" variant="simple" /></div>}>
      <div className="flex flex-col gap-10 md:gap-14">
        {movieLists.map((movie) => <MovieHomeList key={`movie-${movie.name}`} {...movie} />)}
        {tvLists.map((tv) => <TvShowHomeList key={`tv-${tv.name}`} {...tv} />)}
      </div>
    </Suspense>
  </div>;
};

export default HomePageList;
