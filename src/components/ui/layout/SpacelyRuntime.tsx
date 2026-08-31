"use client";

import { tmdb } from "@/api/tmdb";
import useSpacelySettings from "@/hooks/useSpacelySettings";
import { readSettings } from "@/utils/settings";
import { useEffect, useState } from "react";
import { HiXMark } from "react-icons/hi2";

export default function SpacelyRuntime() {
  const settings = useSpacelySettings();
  const [idle, setIdle] = useState(false);
  const [now, setNow] = useState(new Date());
  const [artwork, setArtwork] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("spacely-reduce-motion", settings.disableAnimation);
    root.style.setProperty("--spacely-ambience", settings.ambience ? (settings.ambienceIntensity === "vivid" ? "0.22" : settings.ambienceIntensity === "subtle" ? "0.06" : "0.12") : "0");
    return () => { root.classList.remove("spacely-reduce-motion"); root.style.removeProperty("--spacely-ambience"); };
  }, [settings.disableAnimation, settings.ambience, settings.ambienceIntensity]);

  useEffect(() => {
    if (!settings.screensaver) { setIdle(false); return; }
    let timer: number;
    const reset = () => { setIdle(false); window.clearTimeout(timer); timer = window.setTimeout(() => setIdle(true), settings.screensaverDelay * 60_000); };
    const events = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"];
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    reset();
    return () => { window.clearTimeout(timer); events.forEach((event) => window.removeEventListener(event, reset)); };
  }, [settings.screensaver, settings.screensaverDelay]);

  useEffect(() => {
    if (!idle) return;
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    tmdb.trending.trending("movie", "week").then((result) => {
      const item = result.results.find((entry) => entry.backdrop_path);
      if (item?.backdrop_path) setArtwork(`https://image.tmdb.org/t/p/w1280${item.backdrop_path}`);
    }).catch(() => undefined);
    return () => window.clearInterval(clock);
  }, [idle]);

  if (!idle) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center overflow-hidden bg-black text-white" onPointerDown={() => setIdle(false)} onKeyDown={() => setIdle(false)} role="dialog" aria-label="Spacely ambient screensaver">
      {artwork && <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${artwork})` }} />}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,.35)_45%,#000_100%)]" />
      <div className="relative z-10 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/35">Spacely · Ambient</p>
        <time className="mt-4 block text-7xl font-black tracking-[-0.06em] sm:text-9xl">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
        <p className="mt-3 text-sm text-white/45">{now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>
      <button type="button" onClick={() => setIdle(false)} aria-label="Exit screensaver" className="absolute right-6 top-6 z-20 flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-xl"><HiXMark className="size-5" /></button>
    </div>
  );
}
