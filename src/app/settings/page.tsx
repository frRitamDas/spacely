import { redirect } from "next/navigation";

/** Settings are intentionally presented from the account popover, not as a standalone page. */
export default function SettingsPage() {
  redirect("/");
}
