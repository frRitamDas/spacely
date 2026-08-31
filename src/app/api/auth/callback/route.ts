import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { IS_DEVELOPMENT } from "@/utils/constants";

export const GET = async (request: Request) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/") || next.startsWith("//")) next = "/";
  if (!code) return NextResponse.redirect(`${origin}/auth?error=true`);

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !user) return NextResponse.redirect(`${origin}/auth?error=true`);

  const admin = await createClient(true);
  const metadata = user.user_metadata ?? {};
  const rawBase = String(metadata.username || metadata.full_name || metadata.name || user.email?.split("@")[0] || "user");
  const base = rawBase.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20) || "user";
  const { data: profile } = await (admin.from("profiles") as any).select("id, username").eq("user_id", user.id).maybeSingle();
  if (!profile) {
    let username = `${base.slice(0, 11)}_${user.id.replaceAll("-", "").slice(0, 8)}`;
    const { data: existing } = await (admin.from("profiles") as any).select("id").eq("username", username).maybeSingle();
    if (existing) username = `${base.slice(0, 8)}_${user.id.replaceAll("-", "").slice(0, 12)}`;
    await (admin.from("profiles") as any).upsert({ user_id: user.id, username, display_name: String(metadata.full_name || metadata.name || username) }, { onConflict: "user_id" });
  }

  const host = request.headers.get("x-forwarded-host") || new URL(request.url).host;
  const destination = IS_DEVELOPMENT ? `${origin}${next}` : `https://${host}${next}`;
  return NextResponse.redirect(destination);
};
