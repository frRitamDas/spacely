import { NextPage } from "next";
import dynamic from "next/dynamic";

const Hero = dynamic(() => import("@/components/sections/Home/Hero"));
const ContinueWatching = dynamic(() => import("@/components/sections/Home/ContinueWatching"));
const HomePageList = dynamic(() => import("@/components/sections/Home/List"));

const HomePage: NextPage = () => {
  return (
    <div className="-mt-8 flex flex-col gap-10 pb-12 md:gap-14">
      <Hero />
      <div className="section-shell flex flex-col gap-10 md:gap-14">
        <ContinueWatching />
        <HomePageList />
      </div>
    </div>
  );
};

export default HomePage;
