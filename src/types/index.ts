import { Movie, TV } from "tmdb-ts/dist/types";

export type ContentType = "movie" | "tv";

export type Params<T> = { params: Promise<T> };

export type ActionResponse<T = null> = Promise<{
  success: boolean;
  message?: string;
  data?: T;
}>;

export type MovieParam =
  | "todayTrending"
  | "thisWeekTrending"
  | "popular"
  | "nowPlaying"
  | "upcoming"
  | "topRated";

export type TvShowParam =
  | "todayTrending"
  | "thisWeekTrending"
  | "popular"
  | "onTheAir"
  | "topRated";

export type QueryList<T extends Movie | TV> = {
  name: string;
  query: () => Promise<{
    page: number;
    results: T[];
    total_results: number;
    total_pages: number;
  }>;
  param: T extends Movie ? MovieParam : TvShowParam;
};

export type SiteConfigType = {
  name: string;
  description: string;
  favicon: string;
  navItems: {
    label: string;
    href: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
  }[];
  queryLists: {
    movies: QueryList<Movie>[];
    tvShows: QueryList<TV>[];
  };
  themes: {
    name: "light" | "dark" | "system";
    icon: React.ReactNode;
  }[];
  socials: { github: string };
};

export type PlayersProps = {
  title: string;
  source: `https://${string}`;
  recommended?: boolean;
  fast?: boolean;
  ads?: boolean;
  resumable?: boolean;
};

export type AmbienceIntensity = "subtle" | "standard" | "vivid";
export type ScreensaverDelay = 1 | 2.5 | 5;

export type SpacelySettings = {
  theme: "light" | "dark" | "system";
  ambience: boolean;
  ambienceIntensity: AmbienceIntensity;
  cardTrailers: boolean;
  heroTrailers: boolean;
  continueWatching: boolean;
  forYou: boolean;
  newSeasons: boolean;
  thisWeek: boolean;
  screensaver: boolean;
  screensaverDelay: ScreensaverDelay;
  autoplayNext: boolean;
  autoSkipIntros: boolean;
  spoilerShield: boolean;
  rememberSearches: boolean;
  pauseWatchHistory: boolean;
  disableAnimation: boolean;
  saveWatchHistory: boolean;
  showSpecialSeason: boolean;
};

/** Backwards-compatible alias used by older settings consumers. */
export type Settings = SpacelySettings;
