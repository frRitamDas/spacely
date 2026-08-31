"use client";

import BackdropCard from "@/components/sections/Home/Cards/Backdrop";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import useSpacelySettings from "@/hooks/useSpacelySettings";
import { env } from "@/utils/env";
import { Spinner } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Movie, TV } from "tmdb-ts/dist/types";

const MOVIE_GENRES = [
  [28, "Action"], [878, "Sci-Fi"], [80, "Crime"], [35, "Comedy"], [14, "Fantasy"], [53, "Thriller"], [18, "Drama"], [27, "Horror"], [10749, "Romance"], [9648, "Mystery"], [16, "Animation"], [99, "Documentary"],
] as const;
const TV_GENRES = [
  [10759, "Action & Adventure"], [10765, "Sci-Fi & Fantasy"], [80, "Crime"], [35, "Comedy"], [18, "Drama"], [9648, "Mystery"], [10751, "Family"], [10749, "Romance"], [99, "Documentary"],
] as const;

type Item = Movie | TV;

async function discover(type: "movie" | "tv", genre: number, page: number) {
  const response = await fetch(`https://api.themoviedb.org/3/discover/${type}?language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_genres=${genre}`, {
    headers: { Authorization: `Bearer ${env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`, accept: "application/json" },
    cache: "force-cache",
  });
  if (!response.ok) throw new Error("TMDB discover failed");
  return (await response.json()) as { results: Item[] };
}

export default function InfiniteCategories() {
  const [content] = useQueryState("content", parseAsStringLiteral(["movie", "tv"]).withDefault("movie"));
  const settings = useSpacelySettings();
  const [count, setCount] = useState(3);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const genres = content === "movie" ? MOVIE_GENRES : TV_GENRES;

  useEffect(() => setCount(3), [content]);
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setCount((value) => Math.min(value + 3, 36)); }, { rootMargin: "900px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const rails = Array.from({ length: count }, (_, index) => {
    const [genre, name] = genres[index % genres.length];
    const page = Math.floor(index / genres.length) + 1;
    return <CategoryRail key={`${content}-${genre}-${page}-${index}`} type={content} genre={genre} name={name} page={page} />;
  });

  return <div className="space-y-12">{settings.forYou && settings.continueWatching && rails}<div ref={sentinel} className="flex h-20 items-center justify-center">{count < 36 && <Spinner size="sm" color={content === "movie" ? "primary" : "warning"} />}</div></div>;
}

function CategoryRail({ type, genre, name, page }: { type: "movie" | "tv"; genre: number; name: string; page: number }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let active = true;
    discover(type, genre, page).then((result) => { if (active) setItems(result.results.filter((item) => item.poster_path || item.backdrop_path).slice(0, 20)); }).catch(() => undefined).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [type, genre, page]);

  if (!loading && !items.length) return null;
  return (
    <section ref={ref} className="min-h-[220px]">
      <div className="mb-3 flex items-end justify-between gap-4"><div><SectionTitle>{name}</SectionTitle><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-400">Explore more {type === "movie" ? "movies" : "series"}</p></div></div>
      {loading ? <div className="h-52 animate-pulse rounded-3xl bg-white/[0.03]" /> : <Carousel classNames={{ container: "gap-3 md:gap-4" }}>{items.map((item) => <div key={`${type}-${item.id}`} className="!flex-[0_0_78%] min-w-0 sm:!flex-[0_0_48%] lg:!flex-[0_0_31%] xl:!flex-[0_0_24%]"><BackdropCard media={item as any} /></div>)}</Carousel>}
    </section>
  );
}
