"use client";

import BackButton from "@/components/ui/button/BackButton";
import { siteConfig } from "@/config/site";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { useWindowScroll } from "@mantine/hooks";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BiSearchAlt2 } from "react-icons/bi";
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
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex justify-center px-3 sm:top-5 md:top-6">
        <nav className="spacely-nav pointer-events-auto flex w-auto max-w-[calc(100vw-24px)] items-center gap-1.5 rounded-full p-1.5 sm:gap-2 sm:p-2">
          <div className="flex items-center gap-0.5 sm:gap-1">
            {tabs.map((tab) => (
              <Link key={tab.label} href={tab.href} className={`relative inline-flex h-9 items-center rounded-full px-3.5 text-xs font-bold outline-none transition-colors sm:h-10 sm:px-5 sm:text-sm ${tab.active ? "text-black" : "text-white/65 hover:text-white"}`}>
                {tab.active && <span className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_5px_22px_rgba(0,0,0,.3)]" />}
                {tab.label}
              </Link>
            ))}
          </div>
          <span aria-hidden className="mx-0.5 hidden h-5 w-px bg-white/10 sm:block" />
          <Link href="/search" aria-label="Search" className="spacely-nav-icon"><BiSearchAlt2 /></Link>
          <UserProfileButton />
        </nav>
      </div>
    );
  }

  const opacity = Math.min((y / 120) * 0.9, 0.9);
  return (
    <Navbar disableScrollHandler isBlurred={false} position="sticky" maxWidth="full" classNames={{ base: "border-b border-white/[0.06] bg-transparent py-1", wrapper: "mx-auto w-full max-w-[1800px] px-3 md:px-6 lg:px-8" }} className="inset-0 h-min">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 border-b border-white/[0.06] bg-[#090a0c]/90 backdrop-blur-2xl" style={{ opacity: show ? 0.96 : opacity }} />
      <NavbarBrand className="min-w-fit gap-2"><BackButton href={tv ? "/?content=tv" : "/"} /></NavbarBrand>
      {show && !pathName.startsWith("/search") && (
        <NavbarContent className="hidden w-full max-w-xl gap-2 md:flex" justify="center">
          <NavbarItem className="w-full"><Link href="/search" className="block w-full"><SearchInput className="pointer-events-none border-white/10 bg-white/[0.04] shadow-none backdrop-blur-xl" placeholder="Search movies, series, people..." /></Link></NavbarItem>
        </NavbarContent>
      )}
      <NavbarContent justify="end" className="gap-1">
        <NavbarItem className="flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.025] p-1 backdrop-blur-xl">
          <ThemeSwitchDropdown />
          <UserProfileButton />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default TopNavbar;
