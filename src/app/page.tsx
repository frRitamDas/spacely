"use client";

import { NextPage } from "next";
import dynamic from "next/dynamic";
import useSpacelySettings from "@/hooks/useSpacelySettings";

const Hero = dynamic(() => import("@/components/sections/Home/Hero"));
const ContinueWatching = dynamic(() => import("@/components/sections/Home/ContinueWatching"));
const HomePageList = dynamic(() => import("@/components/sections/Home/List"));
const InfiniteCategories = dynamic(() => import("@/components/sections/Home/InfiniteCategories"));

const HomePage: NextPage = () => {
  const settings = useSpacelySettings();
  return (
    <div className="flex flex-col gap-10 pb-16 md:gap-16">
      <Hero />
      <div className="flex flex-col gap-12 md:gap-16">
        {settings.continueWatching && !settings.pauseWatchHistory && <ContinueWatching />}
        <HomePageList />
        <InfiniteCategories />
      </div>
    </div>
  );
};

export default HomePage;
