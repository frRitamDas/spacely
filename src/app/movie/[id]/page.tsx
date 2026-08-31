"use client";

import { use } from "react";
import { Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/api/tmdb";
import { Params } from "@/types";
import { NextPage } from "next";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

const MediaDetailExperience = dynamic(() => import("@/components/sections/Media/MediaDetailExperience"));

const MovieDetailPage: NextPage<Params<{ id: number }>> = ({ params }) => {
  const { id } = use(params);
  const { data: movie, isPending, error } = useQuery({ queryFn: () => tmdb.movies.details(id, ["images", "videos", "credits", "keywords", "recommendations", "similar", "reviews", "watch/providers"]), queryKey: ["movie-detail", id] });
  if (isPending) return <div className="flex min-h-screen items-center justify-center"><Spinner size="lg" variant="simple" /></div>;
  if (error || !movie) return notFound();
  return <MediaDetailExperience media={movie} type="movie" />;
};

export default MovieDetailPage;
