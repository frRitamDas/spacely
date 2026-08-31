"use client";

import BookmarkButton from "@/components/ui/button/BookmarkButton";
import { siteConfig } from "@/config/site";
import { getImageUrl, mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { Button, Image } from "@heroui/react";
import Link from "next/link";
import { useMemo } from "react";
import { HiArrowLeft, HiCalendarDays, HiCheckCircle, HiClock, HiPlay, HiShare, HiStar } from "react-icons/hi2";
import { Movie, TV } from "tmdb-ts/dist/types";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
import { TvShowDetails } from "tmdb-ts/dist/types/tv-shows";
import { SavedMovieDetails } from "@/types/movie";

type MediaDetail = (MovieDetails | TvShowDetails) & {
  images?: { backdrops?: Array<{ file_path?: string | null }>; logos?: Array<{ file_path?: string | null; iso_639_1?: string | null }> };
  videos?: { results?: Array<{ key: string; site: string; type: string; official?: boolean; name?: string }> };
  credits?: { cast?: Array<{ id: number; name: string; character?: string; profile_path?: string | null }> };
  recommendations?: { results?: Array<Movie | TV> };
  similar?: { results?: Array<Movie | TV> };
};

interface Props { media: MediaDetail; type: "movie" | "tv"; }

const MediaDetailExperience: React.FC<Props> = ({ media, type }) => {
  const isMovie = type === "movie";
  const title = isMovie ? mutateMovieTitle(media as MovieDetails) : mutateTvShowTitle(media as TvShowDetails);
  const year = isMovie ? media.release_date?.slice(0, 4) : media.first_air_date?.slice(0, 4);
  const backdrop = getImageUrl(media.backdrop_path, "backdrop", true);
  const poster = getImageUrl(media.poster_path, "poster");
  const runtime = isMovie ? (media as MovieDetails).runtime : undefined;
  const seasons = !isMovie ? (media as TvShowDetails).number_of_seasons : undefined;
  const episodes = !isMovie ? (media as TvShowDetails).number_of_episodes : undefined;
  const genres = (media.genres ?? []).slice(0, 4);
  const cast = (media.credits?.cast ?? []).filter((person) => person.name).slice(0, 8);
  const related = (media.recommendations?.results?.length ? media.recommendations.results : media.similar?.results ?? []).filter((item) => item.poster_path).slice(0, 8);
  const trailer = useMemo(() => media.videos?.results?.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official) ?? media.videos?.results?.find((video) => video.site === "YouTube" && video.type === "Trailer"), [media.videos?.results]);
  const bookmarkData: SavedMovieDetails = { type, adult: "adult" in media ? Boolean(media.adult) : false, backdrop_path: media.backdrop_path, id: media.id, poster_path: media.poster_path, release_date: (isMovie ? media.release_date : media.first_air_date) || "1900-01-01", title, vote_average: media.vote_average, saved_date: new Date().toISOString() };
  const share = async () => { const url = window.location.href; try { if (navigator.share) await navigator.share({ title, text: `Watch ${title} on ${siteConfig.name}`, url }); else await navigator.clipboard.writeText(url); } catch { /* cancelled */ } };

  return <div className="relative -mx-3 min-h-screen overflow-hidden bg-[#070708] sm:-mx-5">
    <section className="relative min-h-[72svh] overflow-hidden sm:min-h-[78svh]">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backdrop})` }} />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#070708_0%,rgba(7,7,8,.92)_20%,rgba(7,7,8,.46)_58%,rgba(7,7,8,.2)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,#070708_3%,rgba(7,7,8,.78)_20%,transparent_60%)]" />
      <div className="relative z-10 mx-auto flex min-h-[72svh] max-w-[1500px] items-end gap-8 px-5 pb-14 pt-32 sm:min-h-[78svh] sm:px-8 lg:px-12 lg:pb-20">
        <Link href="/" className="absolute left-5 top-24 flex size-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/75 backdrop-blur-xl hover:bg-white/10 hover:text-white sm:left-8 lg:left-12" aria-label="Back to home"><HiArrowLeft className="size-5" /></Link>
        <div className="hidden w-48 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 md:block lg:w-56"><Image removeWrapper src={poster} alt={title} className="aspect-[2/3] h-full w-full object-cover" /></div>
        <div className="max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/55"><span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-white">{isMovie ? "Movie" : "Series"}</span><span>{year || "—"}</span><span>•</span><span className="inline-flex items-center gap-1 text-white/80"><HiStar className="size-3.5" /> {media.vote_average?.toFixed(1) || "—"}</span>{runtime ? <><span>•</span><span>{runtime} min</span></> : null}{seasons ? <><span>•</span><span>{seasons} seasons</span></> : null}</div>
          <h1 className="max-w-4xl text-balance text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">{title}</h1>
          <div className="mt-5 flex flex-wrap gap-2">{genres.map((genre) => <span key={genre.id} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold text-white/60">{genre.name}</span>)}</div>
          <p className="mt-6 max-w-2xl text-sm leading-6 text-white/62 sm:text-base sm:leading-7">{media.overview || "A new title waiting to be discovered."}</p>
          <div className="mt-7 flex flex-wrap items-center gap-2.5"><Button as={Link} href={isMovie ? `/movie/${media.id}/player` : `/tv/${media.id}`} radius="full" size="lg" startContent={<HiPlay className="size-5 fill-current" />} className="h-12 bg-white px-6 font-extrabold text-black">{isMovie ? "Play now" : "View episodes"}</Button>{trailer?.key && <Button as="a" href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noreferrer" radius="full" size="lg" variant="flat" className="h-12 border border-white/10 bg-white/[0.08] px-6 font-bold text-white backdrop-blur-xl">Trailer</Button>}<BookmarkButton data={bookmarkData} isTooltipDisabled /><Button isIconOnly radius="full" aria-label="Share" onPress={share} className="h-12 w-12 border border-white/10 bg-white/[0.08] text-white backdrop-blur-xl"><HiShare className="size-5" /></Button></div>
        </div>
      </div>
    </section>
    <section className="relative z-10 mx-auto grid max-w-[1500px] gap-4 px-5 pb-14 sm:px-8 lg:grid-cols-[1.3fr_.7fr] lg:px-12"><div className="spacely-card rounded-3xl p-6 sm:p-8"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/35"><HiCheckCircle className="size-4" /> About this title</div><p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">{media.overview || "No synopsis is available for this title."}</p></div><div className="spacely-card grid grid-cols-2 rounded-3xl p-5 sm:p-7"><div className="border-b border-white/[0.07] pb-4"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">Release</p><p className="mt-2 flex items-center gap-2 text-sm font-bold text-white/80"><HiCalendarDays className="size-4 text-white/45" /> {year || "—"}</p></div><div className="border-b border-l border-white/[0.07] pb-4 pl-4"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">Rating</p><p className="mt-2 flex items-center gap-2 text-sm font-bold text-white/80"><HiStar className="size-4" /> {media.vote_average?.toFixed(1) || "—"}</p></div><div className="pt-4"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">Format</p><p className="mt-2 text-sm font-bold text-white/80">{isMovie ? "Feature film" : `${seasons || 0} seasons · ${episodes || 0} episodes`}</p></div><div className="border-l border-white/[0.07] pl-4 pt-4"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">Runtime</p><p className="mt-2 flex items-center gap-2 text-sm font-bold text-white/80"><HiClock className="size-4 text-white/45" /> {runtime ? `${runtime} min` : "Series"}</p></div></div></section>
    {cast.length > 0 && <section className="mx-auto max-w-[1500px] px-5 pb-14 sm:px-8 lg:px-12"><div className="mb-5"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">People</p><h2 className="mt-1 text-2xl font-black tracking-tight text-white">Cast</h2></div><div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">{cast.map((person) => <div key={person.id} className="w-28 shrink-0 sm:w-32"><div className="aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">{person.profile_path ? <Image removeWrapper src={getImageUrl(person.profile_path, "avatar")} alt={person.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl font-black text-white/20">{person.name.charAt(0)}</div>}</div><p className="mt-2 truncate text-xs font-bold text-white/75">{person.name}</p><p className="mt-0.5 truncate text-[10px] text-white/30">{person.character || "Cast"}</p></div>)}</div></section>}
    {related.length > 0 && <section className="mx-auto max-w-[1500px] px-5 pb-20 sm:px-8 lg:px-12"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Because you watched this</p><h2 className="mt-1 text-2xl font-black tracking-tight text-white">More like this</h2><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">{related.map((item) => { const itemMovie = "title" in item; const itemTitle = itemMovie ? mutateMovieTitle(item as Movie) : mutateTvShowTitle(item as TV); return <Link key={`${itemMovie ? "movie" : "tv"}-${item.id}`} href={`/${itemMovie ? "movie" : "tv"}/${item.id}`} className="group"><div className="aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"><Image removeWrapper src={getImageUrl(item.poster_path, "poster")} alt={itemTitle} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /></div><p className="mt-2 truncate text-xs font-bold text-white/70 group-hover:text-white">{itemTitle}</p></Link>; })}</div></section>}
  </div>;
};

export default MediaDetailExperience;
