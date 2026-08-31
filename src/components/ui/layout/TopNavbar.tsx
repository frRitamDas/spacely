"use client";

import BackButton from "@/components/ui/button/BackButton";
import { siteConfig } from "@/config/site";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { useWindowScroll } from "@mantine/hooks";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BiSearchAlt2 } from "react-icons/bi";
import FullscreenToggleButton from "../button/FullscreenToggleButton";
import UserProfileButton from "../button/UserProfileButton";
import SearchInput from "../input/SearchInput";
import ThemeSwitchDropdown from "../input/ThemeSwitchDropdown";

const TopNavbar = () => {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const [{ y }] = useWindowScroll();
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);
  const tv = pathName.includes("/tv/");
  const player = pathName.includes("/player");
  const auth = pathName.includes("/auth");
  const home = pathName === "/";
  const content = searchParams.get("content");

  if (auth || player) return null;

  if (home) {
    const tabs = [
      { label: "Home", href: "/", active: !content },
      { label: "Movies", href: "/?content=movie", active: content === "movie" },
      { label: "TV", href: "/?content=tv", active: content === "tv" },
    ];

    return (
      <div className="pointer-events-none fixed inset-x-0 top-5 z-[100] flex justify-center px-3 md:top-7 md:px-4">
        <nav className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/[0.09] bg-[rgba(44,46,54,0.48)] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-[24px] backdrop-saturate-[1.9]">
          <div className="relative flex items-center gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={`relative inline-flex h-11 items-center rounded-full px-[22px] text-[15px] font-semibold outline-none transition-[color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-white/40 ${
                  tab.active ? "text-black" : "text-white/80 hover:scale-[1.04] hover:text-white"
                }`}
              >
                {tab.active && (
                  <span className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_6px_20px_rgba(0,0,0,0.38)]" />
                )}
                {tab.label}
              </Link>
            ))}
          </div>
          <span aria-hidden="true" className="mx-2.5 hidden h-6 w-px bg-white/[0.12] sm:block" />
          <Link
            href="/search"
            aria-label="Search"
            title="Search"
            className="flex size-11 items-center justify-center rounded-full text-white/80 outline-none transition-[color,transform,background-color] hover:scale-[1.06] hover:bg-white/[0.1] hover:text-white focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <BiSearchAlt2 className="size-[15px]" />
          </Link>
          <UserProfileButton />
        </nav>
      </div>
    );
  }

  const opacity = Math.min((y / 160) * 0.92, 0.92);

  return (
    <Navbar
      disableScrollHandler
      isBlurred={false}
      position="sticky"
      maxWidth="full"
      classNames={{
        base: "border-b border-white/5 bg-transparent py-1",
        wrapper: "mx-auto w-full max-w-[1800px] px-3 md:px-6 lg:px-8",
      }}
      className="inset-0 h-min"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 border-b border-white/5 bg-background/80 backdrop-blur-2xl"
        style={{ opacity: show ? 0.96 : opacity }}
      />
      <NavbarBrand className="min-w-fit gap-2">
        <BackButton href={tv ? "/?content=tv" : "/"} />
      </NavbarBrand>
      {show && !pathName.startsWith("/search") && (
        <NavbarContent className="hidden w-full max-w-xl gap-2 md:flex" justify="center">
          <NavbarItem className="w-full">
            <Link href="/search" className="block w-full transition-transform hover:scale-[1.01]">
              <SearchInput
                className="pointer-events-none border-white/10 bg-white/5 shadow-none backdrop-blur-xl"
                placeholder="Search movies, series, people..."
              />
            </Link>
          </NavbarItem>
        </NavbarContent>
      )}
      <NavbarContent justify="end" className="gap-1">
        <NavbarItem className="flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] p-1 backdrop-blur-xl">
          <ThemeSwitchDropdown />
          <FullscreenToggleButton />
          <UserProfileButton />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default TopNavbar;
