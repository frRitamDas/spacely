"use client";

import { getUserHistories } from "@/actions/histories";
import BackdropCard from "@/components/sections/Home/Cards/Backdrop";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import useSpacelySettings from "@/hooks/useSpacelySettings";
import { env } from "@/utils/env";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@heroui/react";

async function tmdbJson(path: string) {
  const response = await fetch(`https://api.themoviedb.org/3${path}`, { headers: { Authorization: `Bearer ${env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`, accept: "application/json" }, cache: "force-cache" });
  if (!response.ok) throw new Error("TMDB request failed");
  return response.json();
}

export default function PersonalizedRails() {
  const settings = useSpacelySettings();
  const { data, isPending } = useQuery({ queryKey: ["spacely-personalized-rails"], queryFn: async () => {
    const historyResult = await getUserHistories(8);
    const history = historyResult.data ?? [];
    const recommendations = new Map<string, any>();
    const watchedTv = history.filter((item: any) => item.type === "tv").slice(0, 5);
    for (const item of history.slice(0, 3)) {
      try {
        const response = await tmdbJson(`/${item.type}/${item.media_id}/recommendations?language=en-US&page=1`);
        for (const result of response.results ?? []) recommendations.set(`${item.type}-${result.id}`, { ...result, media_type: item.type });
      } catch { /* one failed recommendation source must not break the home page */ }
    }
    const newSeasons: any[] = [];
    const schedule: any[] = [];
    for (const item of watchedTv) {
      try {
        const details = await tmdbJson(`/tv/${item.media_id}?language=en-US`);
        if ((details.number_of_seasons ?? 0) > (item.season ?? 0)) newSeasons.push(details);
        if (details.next_episode_to_air?.air_date) {
          const date = new Date(details.next_episode_to_air.air_date);
          const days = (date.getTime() - Date.now()) / 86400000;
          if (days >= -1 && days <= 7) schedule.push({ ...details, next_episode_to_air: details.next_episode_to_air });
        }
      } catch { /* skip unavailable titles */ }
    }
    return { recommendations: [...recommendations.values()].slice(0, 20), newSeasons: newSeasons.slice(0, 12), schedule: schedule.sort((a, b) => a.next_episode_to_air.air_date.localeCompare(b.next_episode_to_air.air_date)) };
  }, enabled: !settings.pauseWatchHistory && (settings.forYou || settings.newSeasons || settings.thisWeek), staleTime: 1000 * 60 * 15 });

  if (settings.pauseWatchHistory || (!settings.forYou && !settings.newSeasons && !settings.thisWeek) || (!isPending && !data?.recommendations.length && !data?.newSeasons.length && !data?.schedule.length)) return null;
  if (isPending) return <div className="flex h-28 items-center justify-center"><Spinner size="sm" /></div>;

  return <div className="flex flex-col gap-12">
    {settings.forYou && data.recommendations.length > 0 && <Rail title="For You" subtitle="Matched to what you've been watching" items={data.recommendations} />}
    {settings.newSeasons && data.newSeasons.length > 0 && <Rail title="New Seasons" subtitle="Shows you've watched with more to explore" items={data.newSeasons} />}
    {settings.thisWeek && data.schedule.length > 0 && <section><SectionTitle>This Week</SectionTitle><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-400">Upcoming episodes from shows you watch</p><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.schedule.map((show: any) => <div key={show.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div className="flex items-center gap-3"><img src={`https://image.tmdb.org/t/p/w185${show.poster_path}`} alt="" className="size-14 rounded-xl object-cover" /><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{show.name}</p><p className="mt-1 text-xs text-white/40">S{show.next_episode_to_air.season_number} E{show.next_episode_to_air.episode_number} · {new Date(show.next_episode_to_air.air_date).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</p></div></div><p className="mt-3 line-clamp-2 text-xs leading-5 text-white/40">{show.next_episode_to_air.name || "New episode"}</p></div>)}</div></section>}
  </div>;
}

function Rail({ title, subtitle, items }: { title: string; subtitle: string; items: any[] }) {
  return <section><SectionTitle>{title}</SectionTitle><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-400">{subtitle}</p><Carousel classNames={{ container: "mt-3 gap-3 md:gap-4" }}>{items.map((item) => <div key={`${item.media_type}-${item.id}`} className="!flex-[0_0_78%] min-w-0 sm:!flex-[0_0_48%] lg:!flex-[0_0_31%] xl:!flex-[0_0_24%]"><BackdropCard media={item} /></div>)}</Carousel></section>;
}
