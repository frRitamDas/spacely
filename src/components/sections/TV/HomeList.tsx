"use client";

import BackdropCard from "@/components/sections/Home/Cards/Backdrop";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import { QueryList } from "@/types";
import { Link, Skeleton } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { kebabCase } from "string-ts";
import { TV } from "tmdb-ts/dist/types";

const TvShowHomeList: React.FC<QueryList<TV>> = ({ query, name, param }) => {
  const key = kebabCase(name) + "-list";
  const { ref, inViewport } = useInViewport();
  const { data, isPending } = useQuery({
    queryFn: query,
    queryKey: [key],
    enabled: inViewport,
  });

  return (
    <section id={key} className="min-h-[220px]" ref={ref}>
      {isPending ? (
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-40 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-44 rounded-2xl md:h-56" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <SectionTitle color="warning">{name}</SectionTitle>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-400">
                Series worth adding to your list
              </p>
            </div>
            <Link
              size="sm"
              href={`/discover?type=${param}&content=tv`}
              isBlock
              color="foreground"
              className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold hover:bg-white/[0.07]"
            >
              See All
            </Link>
          </div>
          <Carousel
            classNames={{
              container: "gap-3 md:gap-4",
            }}
          >
            {data?.results.map((tv) => (
              <div
                key={tv.id}
                className="!flex-[0_0_78%] min-w-0 sm:!flex-[0_0_48%] lg:!flex-[0_0_31%] xl:!flex-[0_0_24%]"
              >
                <BackdropCard media={tv} />
              </div>
            ))}
          </Carousel>
        </div>
      )}
    </section>
  );
};

export default TvShowHomeList;
