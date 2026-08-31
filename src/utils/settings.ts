import { SpacelySettings } from "@/types";

export const SETTINGS_STORAGE_KEY = "spacely-settings-v2";

export const DEFAULT_SETTINGS: SpacelySettings = {
  theme: "dark",
  ambience: true,
  ambienceIntensity: "standard",
  cardTrailers: true,
  heroTrailers: true,
  continueWatching: true,
  forYou: true,
  newSeasons: true,
  thisWeek: true,
  screensaver: true,
  screensaverDelay: 2.5,
  autoplayNext: true,
  autoSkipIntros: false,
  spoilerShield: false,
  rememberSearches: true,
  pauseWatchHistory: false,
  disableAnimation: false,
  saveWatchHistory: true,
  showSpecialSeason: false,
};

export function readSettings(): SpacelySettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || "null");
    return { ...DEFAULT_SETTINGS, ...(saved || {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(settings: SpacelySettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("spacely-settings-change", { detail: settings }));
}
