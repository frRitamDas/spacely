"use client";

import { useEffect, useState } from "react";
import { HiArrowLeft, HiCheck, HiCog6Tooth, HiSparkles } from "react-icons/hi2";
import { AmbienceIntensity, ScreensaverDelay, SpacelySettings } from "@/types";
import { DEFAULT_SETTINGS, readSettings, writeSettings } from "@/utils/settings";

type BooleanKey = {
  [K in keyof SpacelySettings]: SpacelySettings[K] extends boolean ? K : never;
}[keyof SpacelySettings];

const groups: { title: string; items: Array<[BooleanKey, string, string]> }[] = [
  { title: "Browsing", items: [
    ["ambience", "Ambience", "Let the page glow in the artwork's colors."],
    ["cardTrailers", "Card trailer previews", "Preview trailers after resting on a card."],
    ["heroTrailers", "Hero trailers", "Autoplay the featured title trailer."],
    ["continueWatching", "Continue Watching", "Show titles you are currently watching."],
    ["forYou", "For You", "Show picks matched to your viewing."],
    ["newSeasons", "New Seasons", "Flag new seasons for shows you follow."],
    ["thisWeek", "This Week", "Show upcoming episodes from watched shows."],
  ] },
  { title: "Playback", items: [
    ["autoplayNext", "Auto-play next", "Continue to the next episode when supported."],
    ["autoSkipIntros", "Auto-skip intros & recaps", "Skip known intro and recap timings."],
    ["spoilerShield", "Spoiler shield", "Protect unwatched episode artwork and summaries."],
  ] },
  { title: "Search & Privacy", items: [
    ["rememberSearches", "Remember recent searches", "Keep your latest searches on this device."],
    ["pauseWatchHistory", "Pause watch history", "Record no new history or personalization while paused."],
  ] },
  { title: "Ambient mode", items: [["screensaver", "Screensaver", "Dim into trending artwork after inactivity."]] },
];

interface SettingsPopoverProps { onBack: () => void; }

export default function SettingsPopover({ onBack }: SettingsPopoverProps) {
  const [settings, setSettings] = useState<SpacelySettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(readSettings());
  }, []);

  const update = <K extends keyof SpacelySettings>(key: K, value: SpacelySettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    writeSettings(next);
  };

  const toggle = (key: BooleanKey) => update(key, !settings[key]);

  return (
    <div className="w-[min(390px,calc(100vw-24px))] overflow-hidden rounded-[24px] border border-white/10 bg-[#101114]/95 text-white shadow-[0_28px_90px_rgba(0,0,0,.7)] backdrop-blur-3xl">
      <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
        <button type="button" onClick={onBack} aria-label="Back to account" className="flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-white/70 transition hover:bg-white/10 hover:text-white"><HiArrowLeft className="size-4" /></button>
        <div className="flex size-9 items-center justify-center rounded-xl bg-white/[0.07]"><HiCog6Tooth className="size-4" /></div>
        <div className="min-w-0"><p className="text-sm font-extrabold">Settings</p><p className="text-[10px] text-white/35">Your preferences are saved instantly</p></div>
        <HiSparkles className="ml-auto size-4 text-white/30" />
      </div>

      <div className="max-h-[min(70vh,620px)] overflow-y-auto overscroll-contain px-3 py-3 [scrollbar-width:thin]">
        {groups.map((group) => (
          <section key={group.title} className="mb-4 last:mb-0">
            <p className="px-2 pb-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{group.title}</p>
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
              {group.items.map(([key, title, description], index) => (
                <div key={key} className={`flex items-center gap-3 px-3.5 py-3 ${index ? "border-t border-white/[0.055]" : ""}`}>
                  <div className="min-w-0 flex-1"><p className="text-xs font-bold text-white/90">{title}</p><p className="mt-0.5 text-[10px] leading-4 text-white/35">{description}</p></div>
                  <button type="button" role="switch" aria-checked={settings[key]} aria-label={`${title}: ${settings[key] ? "On" : "Off"}`} onClick={() => toggle(key)} className={`relative h-6 w-10 shrink-0 rounded-full border transition-colors ${settings[key] ? "border-white bg-white" : "border-white/10 bg-white/[0.08]"}`}><span className={`absolute top-[3px] size-[18px] rounded-full transition-transform ${settings[key] ? "translate-x-[18px] bg-black" : "translate-x-[3px] bg-white/45"}`} /></button>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="mb-4">
          <p className="px-2 pb-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Ambience intensity</p>
          <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-1">
            {(["subtle", "standard", "vivid"] as AmbienceIntensity[]).map((value) => <button key={value} type="button" onClick={() => update("ambienceIntensity", value)} className={`rounded-xl px-2 py-2 text-[10px] font-bold capitalize transition ${settings.ambienceIntensity === value ? "bg-white text-black" : "text-white/45 hover:bg-white/[0.06] hover:text-white"}`}>{value}</button>)}
          </div>
        </section>

        <section>
          <p className="px-2 pb-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Screensaver starts after</p>
          <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-1">
            {([1, 2.5, 5] as ScreensaverDelay[]).map((value) => <button key={value} type="button" onClick={() => update("screensaverDelay", value)} className={`rounded-xl px-2 py-2 text-[10px] font-bold transition ${settings.screensaverDelay === value ? "bg-white text-black" : "text-white/45 hover:bg-white/[0.06] hover:text-white"}`}>{value === 2.5 ? "2½ min" : `${value} min`}</button>)}
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-3"><span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/30"><HiCheck className="size-3 text-white/60" /> Saved</span><button type="button" onClick={() => update("theme", DEFAULT_SETTINGS.theme)} className="text-[10px] font-bold text-white/30 hover:text-white/70">Reset theme</button></div>
    </div>
  );
}
