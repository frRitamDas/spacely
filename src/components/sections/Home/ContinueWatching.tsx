"use client";

import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import useSpacelySettings from "@/hooks/useSpacelySettings";
import ResumeCard from "./Cards/Resume";
import { useQuery } from "@tanstack/react-query";
import { getUserHistories } from "@/actions/histories";

const ContinueWatching: React.FC = () => {
  const { content } = useDiscoverFilters();
  const settings = useSpacelySettings();
  const { data } = useQuery({ queryFn: () => getUserHistories(), queryKey: ["continue-watching"], enabled: settings.continueWatching && !settings.pauseWatchHistory });

  if (settings.pauseWatchHistory || !settings.continueWatching || !data?.data?.length) return null;

  return (
    <section id="continue-watching" className="min-h-[230px]">
      <div className="flex flex-col gap-3">
        <div>
          <SectionTitle color={content === "movie" ? "primary" : "warning"}>Continue Watching</SectionTitle>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-400">Pick up where you left off</p>
        </div>
        <Carousel classNames={{ container: "gap-3 md:gap-4" }}>
          {data.data.map((media) => <div key={media.id} className="!flex-[0_0_78%] min-w-0 sm:!flex-[0_0_48%] lg:!flex-[0_0_31%] xl:!flex-[0_0_24%]"><ResumeCard media={media} /></div>)}
        </Carousel>
      </div>
    </section>
  );
};

export default ContinueWatching;
