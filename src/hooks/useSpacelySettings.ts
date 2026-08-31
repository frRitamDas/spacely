"use client";

import { useEffect, useState } from "react";
import { SpacelySettings } from "@/types";
import { DEFAULT_SETTINGS, readSettings } from "@/utils/settings";

export default function useSpacelySettings() {
  const [settings, setSettings] = useState<SpacelySettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const sync = () => setSettings(readSettings());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("spacely-settings-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("spacely-settings-change", sync);
    };
  }, []);

  return settings;
}
