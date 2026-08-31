"use client";

import { tmdb } from "@/api/tmdb";
import { getImageUrl, mutateMovieTitle } from "@/utils/movies";
import { Button, Skeleton } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineInformationCircle, HiOutlinePlay } from "react-icons/hi2";

const Hero: React.FC = () => {
  const { data, isPending } = useQuery({
    queryKey: ["home-hero"],
    queryFn: () => tmdb.trending.trending("movie", "week"),
    staleTime: 1000 * 60 * 10,
  });

  const items = useMemo(
    () => (data?.results ?? []).filter((item) => "title" in item && item.backdrop_path),
    [data],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % items.length), 7000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  if (isPending) {
    return <Skeleton className="h-[62vh] min-h-[430px] w-full rounded-[2rem]" />;
  }

  const movie = items[index] ?? items[0];
  if (!movie || !("title" in movie)) return null;

  const title = mutateMovieTitle(movie);
  const backdrop = getImageUrl(movie.backdrop_path, "backdrop", true);

  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(7,7,10,0.98) 0%, rgba(7,7,10,0.84) 38%, rgba(7,7,10,0.24) 72%, rgba(7,7,10,0.68) 100%), linear-gradient(0deg, rgba(7,7,10,0.98) 0%, transparent 48%, rgba(7,7,10,0.15) 100%), url(${backdrop})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      </AnimatePresence>

      <div className="relative flex min-h-[430px] items-end px-6 py-8 md:min-h-[58vh] md:px-12 md:py-12 lg:px-16">
        <div className="max-w-2xl space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            <span className="rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-primary-300">Featured</span>
            <span>Trending this week</span>
          </div>
          <h1 className="max-w-xl text-4xl font-black leading-[0.95] text-white md:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="line-clamp-3 max-w-xl text-sm leading-6 text-white/70 md:text-base">
            {movie.overview || "Discover what everyone is watching right now."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              as={Link}
              href={`/movie/${movie.id}`}
              color="primary"
              size="lg"
              radius="full"
              startContent={<HiOutlinePlay className="size-5 fill-current" />}
              className="font-semibold shadow-lg shadow-primary/20"
            >
              View details
            </Button>
            <Button
              as={Link}
              href={`/movie/${movie.id}`}
              variant="flat"
              size="lg"
              radius="full"
              startContent={<HiOutlineInformationCircle className="size-5" />}
              className="border border-white/10 bg-white/10 text-white backdrop-blur-xl"
            >
              More info
            </Button>
          </div>
          <div className="flex gap-1.5 pt-1">
            {items.slice(0, 6).map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show featured item ${itemIndex + 1}`}
                onClick={() => setIndex(itemIndex)}
                className={`h-1 rounded-full transition-all ${itemIndex === index ? "w-8 bg-primary" : "w-2 bg-white/25 hover:bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
