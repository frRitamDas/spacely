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

const TVShowDetailPage: NextPage<Params<{ id: number }>> = ({ params }) => {
  const { id } = use(params);
  const { data: tv, isPending, error } = useQuery({ queryFn: () => tmdb.tvShows.details(id, ["images", "videos", "credits", "keywords", "recommendations", "similar", "reviews", "watch/providers"]), queryKey: ["tv-show-detail", id] });
  if (isPending) return <div className="flex min-h-screen items-center justify-center"><Spinner size="lg" variant="simple" color="warning" /></div>;
  if (error || !tv) return notFound();
  return <MediaDetailExperience media={tv} type="tv" />;
};

export default TVShowDetailPage;
