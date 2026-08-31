"use client";

import BackButton from "@/components/ui/button/BackButton";
import { siteConfig } from "@/config/site";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { useWindowScroll } from "@mantine/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiSearchAlt2 } from "react-icons/bi";
import FullscreenToggleButton from "../button/FullscreenToggleButton";
import UserProfileButton from "../button/UserProfileButton";
import SearchInput from "../input/SearchInput";
import ThemeSwitchDropdown from "../input/ThemeSwitchDropdown";

const TopNavbar = () => {
  const pathName = usePathname();
  const [{ y }] = useWindowScroll();
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);
  const tv = pathName.includes("/tv/");
  const player = pathName.includes("/player");
  const auth = pathName.includes("/auth");
  const home = pathName === "/";

  if (auth || player) return null;

  if (home) {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-5 z-[100] flex justify-center px-4 md:top-7">
        <nav className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-black/60 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-2xl md:gap-2 md:p-2">
          <Link
            href="/"
            className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-black shadow-lg transition hover:bg-white/90 md:px-8 md:text-base"
          >
            Home
          </Link>
          <Link
            href="/?content=movie"
            className="rounded-full px-5 py-3 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white md:px-6 md:text-base"
          >
            Movies
          </Link>
          <Link
            href="/?content=tv"
            className="rounded-full px-5 py-3 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white md:px-6 md:text-base"
          >
            TV
          </Link>
          <span className="mx-1 hidden h-7 w-px bg-white/15 sm:block" />
          <Link
            href="/search"
            aria-label="Search"
            className="flex size-11 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <BiSearchAlt2 className="size-5" />
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
