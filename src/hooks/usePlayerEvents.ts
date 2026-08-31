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
export type AdapterMap = Record<string, PlayerAdapter<any>>;

export const playerAdapters = {
  vidlink: { origin: "https://vidlink.pro", parse: (raw) => raw.type === "PLAYER_EVENT" ? { ...raw.data, mediaId: raw.data.mtmdbId } : null } satisfies PlayerAdapter<VidlinkPlayerMessage>,
  vidking: { origin: "https://www.vidking.net", parse: (raw) => raw.type === "PLAYER_EVENT" ? { ...raw.data, mediaId: raw.data.id } : null } satisfies PlayerAdapter<VidkingPlayerMessage>,
} as const satisfies AdapterMap;

export interface UsePlayerEventsOptions { metadata?: { season?: number; episode?: number }; saveHistory?: boolean; onPlay?: (data: UnifiedPlayerEventData) => void; onPause?: (data: UnifiedPlayerEventData) => void; onSeeked?: (data: UnifiedPlayerEventData) => void; onEnded?: (data: UnifiedPlayerEventData) => void; onTimeUpdate?: (data: UnifiedPlayerEventData) => void; }

export function usePlayerEvents(options: UsePlayerEventsOptions = {}) {
  const { data: user } = useSupabaseUser();
  const documentState = useDocumentVisibility();
  const { metadata, saveHistory, onPlay, onPause, onSeeked, onEnded, onTimeUpdate } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastEvent, setLastEvent] = useState<PlayerEventType | null>(null);
  const [lastCurrentTime, setLastCurrentTime] = useState(0);
  const eventDataRef = useRef<UnifiedPlayerEventData | null>(null);

  const canSaveHistory = () => saveHistory && !readSettings().pauseWatchHistory && readSettings().saveWatchHistory;

  const syncToServer = async (data: UnifiedPlayerEventData, completed?: boolean) => {
    if (!canSaveHistory() || !user) return;
    if (diff(data.currentTime, lastCurrentTime) <= 5) return;
    const payload = { ...data, season: data.season || metadata?.season || 0, episode: data.episode || metadata?.episode || 0 };
    const { success, message } = await syncHistory(payload, completed);
    if (success) setLastCurrentTime(data.currentTime);
    else console.error("Save history failed:", message);
  };

  useEffect(() => {
    if (!canSaveHistory() || !user || documentState === "visible" || !eventDataRef.current) return;
    syncToServer(eventDataRef.current);
  }, [documentState, lastCurrentTime]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!canSaveHistory() || !user || !eventDataRef.current) return;
      navigator.sendBeacon("/api/player/save-history", JSON.stringify({ ...eventDataRef.current, completed: eventDataRef.current.event === "ended" }));
    };

    const handleMessage = (event: MessageEvent) => {
      const adapter = Object.values(playerAdapters).find((a) => a.origin === event.origin);
      if (!adapter) return;
      let rawData: any;
      try { rawData = typeof event.data === "string" ? JSON.parse(event.data) : event.data; } catch { return; }
      const parsed = adapter.parse(rawData);
      if (!parsed) return;
      eventDataRef.current = parsed;
      setLastEvent(parsed.event);
      switch (parsed.event) {
        case "play": setIsPlaying(true); onPlay?.(parsed); break;
        case "pause": setIsPlaying(false); onPause?.(parsed); break;
        case "ended": setIsPlaying(false); syncToServer(parsed, true); onEnded?.(parsed); break;
        case "seeked": setCurrentTime(parsed.currentTime); setDuration(parsed.duration); onSeeked?.(parsed); break;
        case "timeupdate": setCurrentTime(parsed.currentTime); setDuration(parsed.duration); onTimeUpdate?.(parsed); break;
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => { window.removeEventListener("message", handleMessage); window.removeEventListener("beforeunload", handleBeforeUnload); };
  }, []);

  return { isPlaying, currentTime, duration, lastEvent };
}
