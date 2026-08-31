"use client";

import { Image, Chip, Button } from "@heroui/react";
import { getImageUrl, movieDurationString, mutateMovieTitle } from "@/utils/movies";
import BookmarkButton from "@/components/ui/button/BookmarkButton";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
import Rating from "../../../ui/other/Rating";
import ShareButton from "@/components/ui/button/ShareButton";
import { AppendToResponse } from "tmdb-ts/dist/types/options";
import { useDocumentTitle } from "@mantine/hooks";
import { siteConfig } from "@/config/site";
import { FaCirclePlay } from "react-icons/fa6";
import Genres from "@/components/ui/other/Genres";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Trailer from "@/components/ui/overlay/Trailer";
import { Calendar, Clock } from "@/utils/icons";
import Link from "next/link";
import { SavedMovieDetails } from "@/types/movie";

interface OverviewSectionProps {
  movie: AppendToResponse<MovieDetails, "videos"[], "movie">;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ movie }) => {
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "—";
  const posterImage = getImageUrl(movie.poster_path);
  const title = mutateMovieTitle(movie);
  const bookmarkData: SavedMovieDetails = {
    type: "movie",
    adult: movie.adult,
    backdrop_path: movie.backdrop_path,
    id: movie.id,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    title,
    vote_average: movie.vote_average,
    saved_date: new Date().toISOString(),
  };

  useDocumentTitle(`${title} | ${siteConfig.name}`);

  return (
    <section id="overview" className="relative z-3 flex flex-col gap-8 pt-[20vh] md:pt-[40vh]">
      <div className="glass-strong rounded-[2rem] p-4 shadow-2xl md:p-6 lg:p-8">
        <div className="grid gap-6 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
          <Image
            isBlurred
            shadow="md"
            alt={title}
            classNames={{ wrapper: "hidden aspect-2/3 w-full md:block" }}
            className="rounded-2xl object-cover object-center"
            src={posterImage}
          />

          <div className="flex flex-col gap-7">
            <div id="title" className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Chip color="primary" variant="flat" className="border border-primary/20 bg-primary/10">
                  Movie
                </Chip>
                {movie.adult && (
                  <Chip color="danger" variant="flat" className="border border-danger/20 bg-danger/10">
                    18+
                  </Chip>
                )}
              </div>

              <h2 className="text-3xl font-black leading-tight md:text-5xl">{title}</h2>

              <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-500 md:text-sm">
                <div className="flex items-center gap-1"><Clock /><span>{movieDurationString(movie.runtime)}</span></div>
                <span>•</span>
                <div className="flex items-center gap-1"><Calendar /><span>{releaseYear}</span></div>
                <span>•</span>
                <Rating rate={movie.vote_average || 0} />
              </div>
              <Genres genres={movie.genres} />
            </div>

            <div id="action" className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  as={Link}
                  href={`/movie/${movie.id}/player`}
                  color="primary"
                  size="lg"
                  radius="full"
                  variant="shadow"
                  startContent={<FaCirclePlay size={20} />}
                >
                  Play Now
                </Button>
                <Trailer videos={movie.videos.results} />
              </div>
              <div className="flex gap-2">
                <ShareButton id={movie.id} title={title} />
                <BookmarkButton data={bookmarkData} />
              </div>
            </div>

            <div id="story" className="space-y-3">
              <SectionTitle>Story Line</SectionTitle>
              <p className="max-w-4xl text-sm leading-7 text-foreground-500 md:text-base">
                {movie.overview || "No synopsis is available for this title yet."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewSection;
