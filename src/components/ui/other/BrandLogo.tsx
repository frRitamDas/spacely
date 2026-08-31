"use client";

import Link from "next/link";
import { Saira } from "@/utils/fonts";
import { cn } from "@/utils/helpers";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { HiSparkles } from "react-icons/hi2";

export interface BrandLogoProps {
  animate?: boolean;
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ animate = false, className }) => {
  const { content } = useDiscoverFilters();

  return (
    <Link href="/" className="group">
      <span
        className={cn(
          "flex items-center gap-1.5 bg-linear-to-r from-foreground/70 via-foreground to-foreground/70 bg-clip-text text-2xl font-black text-transparent md:text-3xl",
          "tracking-[0.16em] transition-all duration-300 group-hover:tracking-[0.22em]",
          { "animate-shine": animate },
          Saira.className,
          className,
        )}
      >
        <HiSparkles
          className={cn("size-5 transition-colors md:size-6", {
            "text-primary": content === "movie",
            "text-warning": content === "tv",
            "text-foreground": !content,
          })}
        />
        SPACELY
      </span>
    </Link>
  );
};

export default BrandLogo;
