"use client";

import BackdropCard from "@/components/sections/Home/Cards/Backdrop";
import { tmdb } from "@/api/tmdb";
import { getImageUrl, mutateMovieTitle } from "@/utils/movies";
import { Button, Skeleton } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HiInformationCircle, HiOutlineSpeakerWave, HiOutlineSpeakerXMark, HiPlay } from "react-icons/hi2";
import { Saira } from "@/utils/fonts";

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
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % Math.min(items.length, 8)), 8000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  if (isPending) {
    return <Skeleton className="h-[760px] w-full rounded-none" />;
  }

  const movie = items[index] ?? items[0];
  if (!movie || !("title" in movie)) return null;

  const title = mutateMovieTitle(movie);
  const backdrop = getImageUrl(movie.backdrop_path, "backdrop", true);
  const releaseYear = movie.release_date?.slice(0, 4) || "—";
  const genreText = movie.vote_average >= 8 ? "Top Rated" : "Trending";

  return (
    <section className="relative -mx-3 min-h-[760px] overflow-hidden bg-black md:-mx-6 lg:-mx-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, scale: 1.035 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.82) 30%, rgba(0,0,0,0.22) 65%, rgba(0,0,0,0.72) 100%), linear-gradient(0deg, #000 0%, rgba(0,0,0,0.02) 45%, rgba(0,0,0,0.3) 100%), url(${backdrop})`,
            backgroundPosition: "center top",
            backgroundSize: "cover",
          }}
        />
      </AnimatePresence>

      <div className="absolute inset-y-0 right-0 w-[62%] bg-gradient-to-l from-transparent via-transparent to-black/20" />
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black via-black/60 to-transparent" />

      <div className="relative z-10 flex min-h-[760px] items-center px-6 pb-52 pt-32 md:px-12 md:pb-56 lg:px-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45 }}
            className="max-w-[620px]"
          >
            <div className="mb-5 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-white/65">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-white backdrop-blur-md">{genreText}</span>
              <span>{releaseYear}</span>
              <span>•</span>
              <span>{movie.vote_average.toFixed(1)} Rating</span>
            </div>

            <h1
              className={`${Saira.className} max-w-[680px] text-6xl font-black uppercase leading-[0.88] tracking-tight text-white drop-shadow-2xl md:text-8xl lg:text-[7.5rem]`}
            >
              {title}
            </h1>

            <p className="mt-6 line-clamp-3 max-w-xl text-sm font-medium leading-6 text-white/65 md:text-base">
              {movie.overview || "Discover the latest movies and find your next favorite watch."}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                as={Link}
                href={`/movie/${movie.id}/player`}
                size="lg"
                radius="full"
                startContent={<HiPlay className="size-5 fill-current" />}
                className="h-12 bg-white px-7 text-base font-extrabold text-black shadow-2xl hover:scale-[1.02]"
              >
                Play
              </Button>
              <Button
                as={Link}
                href={`/movie/${movie.id}`}
                size="lg"
                radius="full"
                variant="flat"
                startContent={<HiInformationCircle className="size-5" />}
                className="h-12 border border-white/15 bg-white/10 px-7 text-base font-bold text-white backdrop-blur-xl hover:bg-white/15"
              >
                Info
              </Button>
              <Button
                isIconOnly
                aria-label={muted ? "Unmute" : "Mute"}
                size="lg"
                radius="full"
                variant="flat"
                onPress={() => setMuted((value) => !value)}
                className="h-12 w-12 border border-white/20 bg-white/10 text-white backdrop-blur-xl"
              >
                {muted ? <HiOutlineSpeakerXMark className="size-5" /> : <HiOutlineSpeakerWave className="size-5" />}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-0 bottom-7 z-20 px-6 md:px-12 lg:px-20">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-white md:text-xl">Trending Now</h2>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Popular this week</p>
          </div>
          <div className="flex gap-1.5">
            {items.slice(0, 6).map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show featured movie ${itemIndex + 1}`}
                onClick={() => setIndex(itemIndex)}
                className={`h-1 rounded-full transition-all ${itemIndex === index ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className="w-[72%] shrink-0 sm:w-[48%] lg:w-[31%] xl:w-[24%]">
              <BackdropCard media={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
