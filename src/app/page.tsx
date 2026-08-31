import { NextPage } from "next";
import dynamic from "next/dynamic";

const Hero = dynamic(() => import("@/components/sections/Home/Hero"));
const ContinueWatching = dynamic(() => import("@/components/sections/Home/ContinueWatching"));
const HomePageList = dynamic(() => import("@/components/sections/Home/List"));

const HomePage: NextPage = () => {
  return (
    <div className="flex flex-col gap-10 pb-16 md:gap-16">
      <Hero />
      <div className="flex flex-col gap-12 md:gap-16">
        <ContinueWatching />
        <HomePageList />
      </div>
    </div>
  );
};

export default HomePage;
