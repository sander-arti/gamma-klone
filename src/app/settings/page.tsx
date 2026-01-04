/**
 * Settings Root Page
 *
 * Redirects to workspace settings by default.
 */

import { redirect } from "next/navigation";

export default function SettingsPage() {
  redirect("/settings/workspace");
}
