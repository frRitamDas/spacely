import { syncHistory } from "@/actions/histories";
import { ContentType } from "@/types";
import { diff } from "@/utils/helpers";
import { readSettings } from "@/utils/settings";
import { useDocumentVisibility } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import useSupabaseUser from "./useSupabaseUser";

export type PlayerEventType = "play" | "pause" | "seeked" | "ended" | "timeupdate";
export interface BasePlayerEventEnvelope<T> { type: "PLAYER_EVENT" | "MEDIA_DATA"; data: T; }
export interface VidlinkEventData { event: PlayerEventType; currentTime: number; duration: number; mtmdbId: number; mediaType: ContentType; season?: number; episode?: number; }
export type VidlinkPlayerMessage = BasePlayerEventEnvelope<VidlinkEventData>;
export interface VidkingEventData { event: PlayerEventType; currentTime: number; duration: number; id: string | number; mediaType: ContentType; season?: number; episode?: number; progress?: number; }
export type VidkingPlayerMessage = BasePlayerEventEnvelope<VidkingEventData>;
export interface UnifiedPlayerEventData { event: PlayerEventType; currentTime: number; duration: number; mediaId: string | number; mediaType: ContentType; season?: number; episode?: number; progress?: number; }
export interface PlayerAdapter<RawMessage extends BasePlayerEventEnvelope<any>> { origin: `https://${string}`; parse: (raw: RawMessage) => UnifiedPlayerEventData | null; }

export const playerAdapters = {
  vidlink: { origin: "https://vidlink.pro", parse: (raw: VidlinkPlayerMessage) => raw.type === "PLAYER_EVENT" ? { ...raw.data, mediaId: raw.data.mtmdbId } : null } satisfies PlayerAdapter<VidlinkPlayerMessage>,
  vidking: { origin: "https://www.vidking.net", parse: (raw: VidkingPlayerMessage) => raw.type === "PLAYER_EVENT" ? { ...raw.data, mediaId: raw.data.id } : null } satisfies PlayerAdapter<VidkingPlayerMessage>,
};

export interface UsePlayerEventsOptions { metadata?: { season?: number; episode?: number }; saveHistory?: boolean; onPlay?: (data: UnifiedPlayerEventData) => void; onPause?: (data: UnifiedPlayerEventData) => void; onSeeked?: (data: UnifiedPlayerEventData) => void; onEnded?: (data: UnifiedPlayerEventData) => void; onTimeUpdate?: (data: UnifiedPlayerEventData) => void; }

export function usePlayerEvents(options: UsePlayerEventsOptions = {}) {
  const { data: user } = useSupabaseUser();
  const documentState = useDocumentVisibility();
  const { metadata, saveHistory = false, onPlay, onPause, onSeeked, onEnded, onTimeUpdate } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastEvent, setLastEvent] = useState<PlayerEventType | null>(null);
  const [lastCurrentTime, setLastCurrentTime] = useState(0);
  const eventDataRef = useRef<UnifiedPlayerEventData | null>(null);
  const userRef = useRef(user);
  const optionsRef = useRef({ metadata, saveHistory, onPlay, onPause, onSeeked, onEnded, onTimeUpdate });
  const lastCurrentTimeRef = useRef(0);
  const lastEventRef = useRef<PlayerEventType | null>(null);

  userRef.current = user;
  optionsRef.current = { metadata, saveHistory, onPlay, onPause, onSeeked, onEnded, onTimeUpdate };
  lastCurrentTimeRef.current = lastCurrentTime;
  lastEventRef.current = lastEvent;

  const canSaveHistory = () => {
    const settings = readSettings();
    return Boolean(optionsRef.current.saveHistory && userRef.current && settings.saveWatchHistory && !settings.pauseWatchHistory);
  };

  const syncToServer = async (data: UnifiedPlayerEventData, completed = false) => {
    if (!canSaveHistory()) return;
    if (!completed && diff(data.currentTime, lastCurrentTimeRef.current) <= 5) return;
    const metadataNow = optionsRef.current.metadata;
    const payload = { ...data, season: data.season || metadataNow?.season || 0, episode: data.episode || metadataNow?.episode || 0 };
    const { success, message } = await syncHistory(payload, completed);
    if (success) {
      setLastCurrentTime(data.currentTime);
      lastCurrentTimeRef.current = data.currentTime;
    } else console.error("Save history failed:", message);
  };

  useEffect(() => {
    if (documentState !== "hidden" || !eventDataRef.current || lastEventRef.current === "pause") return;
    void syncToServer(eventDataRef.current);
  }, [documentState]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const data = eventDataRef.current;
      if (!data || data.event === "pause" || !canSaveHistory()) return;
      navigator.sendBeacon("/api/player/save-history", JSON.stringify({ ...data, completed: data.event === "ended" }));
    };

    const handleMessage = (event: MessageEvent) => {
      const adapter = Object.values(playerAdapters).find((candidate) => candidate.origin === event.origin);
      if (!adapter) return;
      let rawData: unknown;
      try { rawData = typeof event.data === "string" ? JSON.parse(event.data) : event.data; } catch { return; }
      const parsed = adapter.parse(rawData as never);
      if (!parsed) return;
      eventDataRef.current = parsed;
      lastEventRef.current = parsed.event;
      setLastEvent(parsed.event);
      switch (parsed.event) {
        case "play": setIsPlaying(true); optionsRef.current.onPlay?.(parsed); break;
        case "pause": setIsPlaying(false); optionsRef.current.onPause?.(parsed); break;
        case "ended": setIsPlaying(false); void syncToServer(parsed, true); optionsRef.current.onEnded?.(parsed); break;
        case "seeked": setCurrentTime(parsed.currentTime); setDuration(parsed.duration); optionsRef.current.onSeeked?.(parsed); break;
        case "timeupdate": setCurrentTime(parsed.currentTime); setDuration(parsed.duration); optionsRef.current.onTimeUpdate?.(parsed); break;
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => { window.removeEventListener("message", handleMessage); window.removeEventListener("beforeunload", handleBeforeUnload); };
  }, []);

  return { isPlaying, currentTime, duration, lastEvent };
}
