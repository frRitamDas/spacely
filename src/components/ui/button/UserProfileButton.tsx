"use client";

import { signOut } from "@/actions/auth";
import SettingsPopover from "@/components/ui/layout/SettingsPopover";
import useBreakpoints from "@/hooks/useBreakpoints";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import { env } from "@/utils/env";
import { Gear, Logout, User } from "@/utils/icons";
import { useRouter } from "@bprogress/next/app";
import { addToast, Avatar, Button, Popover, PopoverContent, PopoverTrigger, Spinner } from "@heroui/react";
import Link from "next/link";
import { useState } from "react";

const UserProfileButton: React.FC = () => {
  const router = useRouter();
  const [logout, setLogout] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { data: user, isLoading } = useSupabaseUser();
  const { mobile } = useBreakpoints();

  if (isLoading) return null;
  const guest = !user;
  const avatar = user?.email && env.NEXT_PUBLIC_AVATAR_PROVIDER_URL
    ? `${env.NEXT_PUBLIC_AVATAR_PROVIDER_URL}?seed=${encodeURIComponent(user.email)}`
    : undefined;

  const profileButton = (
    <Button
      title={guest ? "Login" : user.username}
      variant="light"
      href={guest ? "/auth" : undefined}
      as={guest ? Link : undefined}
      isIconOnly={guest || mobile}
      endContent={!guest ? <Avatar showFallback src={avatar} className="size-7" fallback={<User className="text-xl" />} /> : undefined}
      className="min-w-fit bg-transparent text-white/80 hover:bg-white/[0.08] hover:text-white"
    >
      {guest ? <User className="text-xl" /> : <p className="hidden max-w-32 truncate md:block lg:max-w-56">{user.username}</p>}
    </Button>
  );

  if (guest) return profileButton;

  return (
    <Popover placement="bottom-end" offset={10} isOpen={accountOpen} onOpenChange={setAccountOpen}>
      <PopoverTrigger>{profileButton}</PopoverTrigger>
      <PopoverContent className="overflow-visible bg-transparent p-0 shadow-none">
        {settingsOpen ? <SettingsPopover onBack={() => setSettingsOpen(false)} /> : (
          <div className="w-64 overflow-hidden rounded-[22px] border border-white/10 bg-[#101114]/95 p-2 text-white shadow-[0_28px_90px_rgba(0,0,0,.7)] backdrop-blur-3xl">
            <div className="mb-1 flex items-center gap-3 rounded-2xl bg-white/[0.04] px-3 py-3">
              <Avatar showFallback src={avatar} className="size-10" fallback={<User className="text-lg" />} />
              <div className="min-w-0"><p className="truncate text-sm font-extrabold">{user.username}</p><p className="truncate text-[10px] text-white/35">{user.email}</p></div>
            </div>
            <button type="button" onClick={() => setSettingsOpen(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold text-white/75 transition hover:bg-white/[0.07] hover:text-white"><Gear className="size-4" /> Settings <span className="ml-auto text-white/20">›</span></button>
            <button type="button" disabled={logout} onClick={async () => { setLogout(true); const { success, message } = await signOut(); addToast({ title: message, color: success ? "primary" : "danger" }); if (!success) { setLogout(false); return; } router.push("/auth"); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold text-danger/80 transition hover:bg-danger/10 hover:text-danger disabled:opacity-50"><Logout className="size-4" /> {logout ? "Signing out…" : "Sign out"}<span className="ml-auto">{logout && <Spinner size="sm" color="danger" />}</span></button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default UserProfileButton;
