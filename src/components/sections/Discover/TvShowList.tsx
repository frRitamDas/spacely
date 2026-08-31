"use client";

import BackToTopButton from "@/components/ui/button/BackToTopButton";
import Loop from "@/components/ui/other/Loop";
import PosterCardSkeleton from "@/components/ui/other/PosterCardSkeleton";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import useFetchDiscoverTvShows from "@/hooks/useFetchDiscoverTvShow";
import { DiscoverTvShowsFetchQueryType } from "@/types/movie";
import { getLoadingLabel } from "@/utils/movies";
import { Spinner } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import TvShowPosterCard from "../TV/Cards/Poster";

const TvShowDiscoverList = () => {
  const { ref, inViewport } = useInViewport();
  const { genresString, queryType } = useDiscoverFilters();
  const { data, isPending, status, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["discover-tv-shows", queryType, genresString],
      queryFn: ({ pageParam }) =>
        useFetchDiscoverTvShows({
          page: pageParam,
          type: queryType as DiscoverTvShowsFetchQueryType,
          genres: genresString,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    });

  useEffect(() => {
    if (inViewport && !isPending && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inViewport, isFetchingNextPage, isPending]);

  if (status === "error") {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-foreground-500">
        Unable to load TV series right now. Please try again in a moment.
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-10">
        <div className="movie-grid">
          <Loop count={20} prefix="SkeletonDiscoverPosterCard">
            <PosterCardSkeleton variant="bordered" />
          </Loop>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <div className="movie-grid">
        {data.pages.flatMap((page) =>
          page.results.map((tv) => (
            <TvShowPosterCard key={tv.id} tv={tv} variant="bordered" />
          )),
        )}
      </div>
      <div ref={ref} className="flex h-24 items-center justify-center">
        {isFetchingNextPage && (
          <Spinner size="lg" variant="wave" color="warning" label={getLoadingLabel()} />
        )}
        {!hasNextPage && !isPending && (
          <p className="text-muted-foreground text-center text-base">
            You have reached the end of the list.
          </p>
        )}
      </div>
      <BackToTopButton />
    </div>
  );
};

export default TvShowDiscoverList;
