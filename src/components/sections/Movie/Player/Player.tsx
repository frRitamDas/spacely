"use client";

import { ADS_WARNING_STORAGE_KEY, SpacingClasses } from "@/utils/constants";
import { siteConfig } from "@/config/site";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";
import { mutateMovieTitle } from "@/utils/movies";
import { getMoviePlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle, useLocalStorage } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMemo } from "react";
import { HiArrowLeft, HiPlay, HiServer, HiSignal } from "react-icons/hi2";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
import { usePlayerEvents } from "@/hooks/usePlayerEvents";
import useSpacelySettings from "@/hooks/useSpacelySettings";

const AdsWarning = dynamic(() => import("@/components/ui/overlay/AdsWarning"));
const MoviePlayerSourceSelection = dynamic(() => import("./SourceSelection"));

interface MoviePlayerProps { movie: MovieDetails; startAt?: number; }

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : `${minutes}:${String(secs).padStart(2, "0")}`;
};

const MoviePlayer: React.FC<MoviePlayerProps> = ({ movie, startAt }) => {
  const [seen] = useLocalStorage<boolean>({ key: ADS_WARNING_STORAGE_KEY, getInitialValueInEffect: false });
  const players = getMoviePlayers(movie.id, startAt);
  const title = mutateMovieTitle(movie);
  const idle = useIdle(3500);
  const { mobile } = useBreakpoints();
  const settings = useSpacelySettings();
  const [opened, handlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>("src", parseAsInteger.withDefault(0));
  const { isPlaying, currentTime, duration } = usePlayerEvents({ saveHistory: settings.saveWatchHistory, onPlay: () => undefined });

  useDocumentTitle(`Play ${title} | ${siteConfig.name}`);
  const player = useMemo(() => players[selectedSource] || players[0], [players, selectedSource]);
  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <>
      <AdsWarning />
      <main className={cn("player-shell", SpacingClasses.reset)}>
        <div className={cn("player-topbar absolute inset-x-0 top-0 z-40 flex items-start justify-between gap-3 px-3 pb-14 pt-3 transition-opacity duration-300 sm:px-5 sm:pt-5", idle && !mobile ? "pointer-events-none opacity-0" : "opacity-100")}>
          <a href={`/movie/${movie.id}`} aria-label="Back to movie" className="player-pill flex size-11 items-center justify-center rounded-full text-white/85 transition hover:bg-white/10"><HiArrowLeft className="size-5" /></a>
          <div className="player-pill hidden max-w-[min(60vw,520px)] items-center gap-3 rounded-2xl px-4 py-2.5 text-center sm:flex">
            <HiPlay className="size-4 shrink-0 text-white/60" />
            <div className="min-w-0"><p className="truncate text-sm font-extrabold text-white">{title}</p><p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-white/35">{isPlaying ? "Playing" : "Paused"}</p></div>
          </div>
          <button type="button" onClick={handlers.open} aria-label="Change playback source" className="player-pill flex h-11 items-center gap-2 rounded-full px-3 text-xs font-bold text-white/80 transition hover:bg-white/10 sm:px-4"><HiServer className="size-4" /><span className="hidden sm:inline">Sources</span></button>
        </div>

        <Card shadow="none" radius="none" className="relative h-[100svh] min-h-[320px] overflow-hidden border-0 bg-black">
          <Skeleton className="absolute inset-0 h-full w-full rounded-none bg-white/[0.035]" />
          {seen && <iframe title={`${title} player`} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen loading="eager" key={player.title} src={player.source} className="relative z-10 h-full w-full bg-black" />}
        </Card>

        <div className={cn("player-bottombar pointer-events-none absolute inset-x-0 bottom-0 z-40 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-24 transition-opacity duration-300 sm:px-6", idle && !mobile ? "opacity-0" : "opacity-100")}>
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-2">
            <div className="player-progress"><span style={{ width: `${progress}%` }} /></div>
            <div className="flex items-center justify-between text-[10px] font-semibold tabular-nums text-white/45"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
            <div className="pointer-events-auto mt-1 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2"><HiSignal className="size-3.5 text-white/40" /><span className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">{player.title}</span></div>
              <button type="button" onClick={handlers.open} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-[10px] font-bold text-white/65 backdrop-blur-xl transition hover:bg-white/10 hover:text-white">Change source</button>
            </div>
          </div>
        </div>
      </main>

      <MoviePlayerSourceSelection opened={opened} onClose={handlers.close} players={players} selectedSource={selectedSource} setSelectedSource={setSelectedSource} />
    </>
  );
};

MoviePlayer.displayName = "MoviePlayer";
export default MoviePlayer;
