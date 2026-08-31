import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { queryClient } from "@/app/providers";
export type AuthUserData = User & { username: string };
const fetchUser = async (): Promise<AuthUserData | null> => { const supabase = createClient(); const { data: { user }, error: userError } = await supabase.auth.getUser(); if (userError || !user) return null; const { data: profile, error: profileError } = await (supabase.from("profiles") as any).select("username").eq("user_id", user.id).maybeSingle(); if (profileError) { console.error("Error fetching profile:", profileError.message); return null; } if (!profile?.username) return null; return { ...user, username: profile.username }; };
const useSupabaseUser = () => { const supabase = createClient(); const query = useQuery({ queryKey: ["supabase-user"], queryFn: fetchUser, staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false }); useEffect(() => { const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { queryClient.invalidateQueries({ queryKey: ["supabase-user"] }); }); return () => subscription.unsubscribe(); }, [supabase]); return query; };
export default useSupabaseUser;
