"use client";

import { useEffect, useState } from "react";
import { HiArrowLeft, HiCheck, HiCog6Tooth, HiMoon, HiSun } from "react-icons/hi2";
import { AmbienceIntensity, ScreensaverDelay, SpacelySettings } from "@/types";
import { DEFAULT_SETTINGS, readSettings, writeSettings } from "@/utils/settings";
import { useTheme } from "next-themes";

type BooleanKey = { [K in keyof SpacelySettings]: SpacelySettings[K] extends boolean ? K : never; }[keyof SpacelySettings];

const groups: { title: string; items: Array<[BooleanKey, string, string]> }[] = [
  { title: "Browsing", items: [["ambience", "Ambience", "Let the interface softly borrow the artwork's colors."], ["cardTrailers", "Card trailer previews", "Preview a trailer after resting on a title."], ["heroTrailers", "Hero trailers", "Start the featured trailer after five seconds."], ["continueWatching", "Continue Watching", "Keep unfinished titles on Home."], ["forYou", "For You", "Show recommendations shaped by your activity."], ["newSeasons", "New Seasons", "Highlight fresh seasons from shows you follow."], ["thisWeek", "This Week", "Surface upcoming episodes from watched shows."]] },
  { title: "Playback", items: [["autoplayNext", "Auto-play next", "Continue automatically when the next title is available."], ["autoSkipIntros", "Auto-skip intros & recaps", "Skip known intro and recap timings when supported."], ["spoilerShield", "Spoiler shield", "Protect unwatched episode art and descriptions."]] },
  { title: "Search & privacy", items: [["rememberSearches", "Remember recent searches", "Keep recent searches on this device."], ["pauseWatchHistory", "Pause watch history", "While paused, nothing you watch is recorded or personalized."], ["saveWatchHistory", "Save watch history", "Sync playback progress to your Spacely account."]] },
  { title: "Ambient mode", items: [["screensaver", "Screensaver", "Dim into trending artwork after inactivity."]] },
];

export default function SettingsPopover({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState<SpacelySettings>(DEFAULT_SETTINGS);
  const { setTheme } = useTheme();
  useEffect(() => setSettings(readSettings()), []);
  const update = <K extends keyof SpacelySettings>(key: K, value: SpacelySettings[K]) => {
    const next = { ...settings, [key]: value }; setSettings(next); writeSettings(next);
    if (key === "theme") setTheme(value as "light" | "dark" | "system");
  };
  const toggle = (key: BooleanKey) => update(key, !settings[key]);

  return <div className="w-[min(410px,calc(100vw-18px))] overflow-hidden rounded-[26px] border border-white/10 bg-[#0d0e11]/96 text-white shadow-[0_32px_100px_rgba(0,0,0,.75)] backdrop-blur-3xl">
    <div className="flex items-center gap-3 border-b border-white/[.07] px-4 py-3.5"><button type="button" onClick={onBack} aria-label="Back to account" className="flex size-9 items-center justify-center rounded-full bg-white/[.06] text-white/65 hover:bg-white/10 hover:text-white"><HiArrowLeft className="size-4" /></button><div className="flex size-9 items-center justify-center rounded-xl bg-white/[.07]"><HiCog6Tooth className="size-4" /></div><div className="min-w-0"><p className="text-sm font-extrabold">Settings</p><p className="text-[10px] text-white/35">Changes apply instantly</p></div><span className="ml-auto inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.16em] text-white/30"><HiCheck className="size-3 text-white/60" /> Saved</span></div>
    <div className="max-h-[min(72vh,660px)] overflow-y-auto px-3 py-3 [scrollbar-width:thin]">
      <section className="mb-4"><p className="px-2 pb-2 text-[9px] font-black uppercase tracking-[.2em] text-white/30">Appearance</p><div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/[.07] bg-white/[.025] p-1">{(["dark", "light", "system"] as const).map((value) => <button key={value} type="button" onClick={() => update("theme", value)} className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[10px] font-bold capitalize ${settings.theme === value ? "bg-white text-black" : "text-white/45 hover:bg-white/[.06] hover:text-white"}`}>{value === "dark" ? <HiMoon className="size-3.5" /> : value === "light" ? <HiSun className="size-3.5" /> : null}{value}</button>)}</div></section>
      {groups.map((group) => <section key={group.title} className="mb-4 last:mb-0"><p className="px-2 pb-2 text-[9px] font-black uppercase tracking-[.2em] text-white/30">{group.title}</p><div className="overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.025]">{group.items.map(([key, title, description], index) => <div key={key} className={`flex items-center gap-3 px-3.5 py-3 ${index ? "border-t border-white/[.055]" : ""}`}><div className="min-w-0 flex-1"><p className="text-xs font-bold text-white/90">{title}</p><p className="mt-0.5 text-[10px] leading-4 text-white/35">{description}</p></div><button type="button" role="switch" aria-checked={settings[key]} aria-label={`${title}: ${settings[key] ? "On" : "Off"}`} onClick={() => toggle(key)} className={`relative h-6 w-10 shrink-0 rounded-full border ${settings[key] ? "border-white bg-white" : "border-white/10 bg-white/[.08]"}`}><span className={`absolute top-[3px] size-[18px] rounded-full ${settings[key] ? "translate-x-[18px] bg-black" : "translate-x-[3px] bg-white/45"}`} /></button></div>)}</div></section>)}
      <section className="mb-4"><p className="px-2 pb-2 text-[9px] font-black uppercase tracking-[.2em] text-white/30">Ambience intensity</p><div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/[.07] bg-white/[.025] p-1">{(["subtle", "standard", "vivid"] as AmbienceIntensity[]).map((value) => <button key={value} type="button" onClick={() => update("ambienceIntensity", value)} className={`rounded-xl px-2 py-2 text-[10px] font-bold capitalize ${settings.ambienceIntensity === value ? "bg-white text-black" : "text-white/45 hover:bg-white/[.06] hover:text-white"}`}>{value}</button>)}</div></section>
      <section><p className="px-2 pb-2 text-[9px] font-black uppercase tracking-[.2em] text-white/30">Screensaver starts after</p><div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/[.07] bg-white/[.025] p-1">{([1, 2.5, 5] as ScreensaverDelay[]).map((value) => <button key={value} type="button" onClick={() => update("screensaverDelay", value)} className={`rounded-xl px-2 py-2 text-[10px] font-bold ${settings.screensaverDelay === value ? "bg-white text-black" : "text-white/45 hover:bg-white/[.06] hover:text-white"}`}>{value === 2.5 ? "2½ min" : `${value} min`}</button>)}</div></section>
    </div>
  </div>;
}
