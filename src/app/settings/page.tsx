"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HiArrowLeft, HiCheck, HiCog6Tooth } from "react-icons/hi2";
import { AmbienceIntensity, ScreensaverDelay, SpacelySettings } from "@/types";
import { DEFAULT_SETTINGS, readSettings, writeSettings } from "@/utils/settings";

const groups = [
  {
    title: "Browsing",
    items: [
      ["ambience", "Ambience", "Let the page glow subtly in the artwork's colors.", "toggle"],
      ["cardTrailers", "Card trailer previews", "Play a muted trailer when you rest on a card for a moment.", "toggle"],
      ["heroTrailers", "Hero trailers", "Autoplay the featured title's trailer at the top of Home, Movies and TV.", "toggle"],
      ["continueWatching", "Continue Watching", "Show your in-progress titles on the homepage.", "toggle"],
      ["forYou", "For You", "Show picks matched to what you've been watching.", "toggle"],
      ["newSeasons", "New Seasons", "Flag shows when a new season arrives.", "toggle"],
      ["thisWeek", "This Week", "Show upcoming episodes from shows you watch.", "toggle"],
    ],
  },
  {
    title: "Ambience",
    items: [["ambienceIntensity", "Intensity", "Controls how strongly artwork colors tint the page.", "ambience"]],
  },
  {
    title: "Screensaver",
    items: [["screensaver", "Ambient mode", "After sitting idle, dim into trending artwork with a clock. Any input wakes it.", "toggle"], ["screensaverDelay", "Starts after", "Choose how long Spacely waits before entering ambient mode.", "screensaver"]],
  },
  {
    title: "Playback",
    items: [
      ["autoplayNext", "Auto-play next", "Count down and jump to the next episode when supported.", "toggle"],
      ["autoSkipIntros", "Auto-skip intros & recaps", "Skip known intro and recap timings when the player provides them.", "toggle"],
      ["spoilerShield", "Spoiler shield", "Blur stills and synopses for episodes you haven't watched.", "toggle"],
    ],
  },
  {
    title: "Search",
    items: [["rememberSearches", "Remember recent searches", "Keep your recent picks in the search panel for quick access.", "toggle"]],
  },
  {
    title: "Privacy",
    items: [["pauseWatchHistory", "Pause watch history", "While paused, Spacely records no new history, stats or personalization.", "toggle"]],
  },
];

type Key = keyof SpacelySettings;

export default function SettingsPage() {
  const [settings, setSettings] = useState<SpacelySettings>(DEFAULT_SETTINGS);

  useEffect(() => setSettings(readSettings()), []);

  const update = <K extends Key>(key: K, value: SpacelySettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    writeSettings(next);
  };

  return (
    <main className="mx-auto w-full max-w-4xl pb-20 pt-8 md:pt-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/60 transition hover:bg-white/[0.08] hover:text-white">
            <HiArrowLeft className="size-4" /> Back
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <HiCog6Tooth className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Settings</h1>
              <p className="mt-1 text-sm text-white/40">Tune Spacely to exactly how you watch.</p>
            </div>
          </div>
        </div>
        <button type="button" onClick={() => { setSettings(DEFAULT_SETTINGS); writeSettings(DEFAULT_SETTINGS); }} className="hidden rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-white/50 transition hover:bg-white/[0.08] hover:text-white sm:block">Reset</button>
      </div>

      <div className="space-y-7">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{group.title}</h2>
            <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur-xl">
              {group.items.map(([rawKey, title, description, kind], index) => {
                const key = rawKey as Key;
                return (
                  <div key={key} className={`flex min-h-[78px] items-center gap-5 px-5 py-4 md:px-6 ${index ? "border-t border-white/[0.06]" : ""}`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white">{title}</p>
                      <p className="mt-1 max-w-2xl text-xs leading-5 text-white/40">{description}</p>
                    </div>
                    {kind === "toggle" && (
                      <button type="button" role="switch" aria-checked={Boolean(settings[key])} onClick={() => update(key, !settings[key])} className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${settings[key] ? "border-white bg-white" : "border-white/10 bg-white/10"}`}>
                        <span className={`absolute top-1 size-5 rounded-full transition-transform ${settings[key] ? "translate-x-6 bg-black" : "translate-x-1 bg-white/60"}`} />
                      </button>
                    )}
                    {kind === "ambience" && (
                      <div className="flex shrink-0 overflow-hidden rounded-full border border-white/10 bg-black/20 p-1">
                        {(["subtle", "standard", "vivid"] as AmbienceIntensity[]).map((value) => <button key={value} type="button" onClick={() => update("ambienceIntensity", value)} className={`rounded-full px-3 py-1.5 text-[10px] font-bold capitalize transition ${settings.ambienceIntensity === value ? "bg-white text-black" : "text-white/40 hover:text-white"}`}>{value}</button>)}
                      </div>
                    )}
                    {kind === "screensaver" && (
                      <div className="flex shrink-0 overflow-hidden rounded-full border border-white/10 bg-black/20 p-1">
                        {([1, 2.5, 5] as ScreensaverDelay[]).map((value) => <button key={value} type="button" onClick={() => update("screensaverDelay", value)} className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition ${settings.screensaverDelay === value ? "bg-white text-black" : "text-white/40 hover:text-white"}`}>{value === 2.5 ? "2½ min" : `${value} min`}</button>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-emerald-400/10 bg-emerald-400/[0.03] p-5 text-xs leading-5 text-white/35">
        <span className="mr-2 inline-flex items-center gap-1 font-bold text-emerald-300/70"><HiCheck className="size-4" /> Saved automatically</span>
        Preferences are stored locally on this device. Pausing watch history immediately disables history-based personalization.
      </div>
    </main>
  );
}
