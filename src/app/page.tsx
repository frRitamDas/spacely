import { NextPage } from "next";
import dynamic from "next/dynamic";

const Hero = dynamic(() => import("@/components/sections/Home/Hero"));
const ContinueWatching = dynamic(() => import("@/components/sections/Home/ContinueWatching"));
const HomePageList = dynamic(() => import("@/components/sections/Home/List"));

const HomePage: NextPage = () => {
  return (
    <div className="flex flex-col gap-8 pb-12 md:gap-12">
      <Hero />
      <ContinueWatching />
      <HomePageList />
    </div>
  );
};

export default HomePage;
