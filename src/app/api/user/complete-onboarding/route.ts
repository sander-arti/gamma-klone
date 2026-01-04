/**
 * POST /api/user/complete-onboarding
 *
 * Marks the onboarding tour as completed for the current user.
 * This prevents the tour from showing again.
 */

import { createClient } from "@/lib/db/supabase-server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date().toISOString();

    // Update user's onboarding status
    const { error } = await supabase
      .from("users")
      .update({
        onboarding_completed: true,
        onboarding_completed_at: now,
      })
      .eq("id", user.id);

    if (error) {
      console.error("[complete-onboarding] Failed to update user:", error);
      return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
    }

    console.log(`[complete-onboarding] User ${user.id} completed onboarding`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[complete-onboarding] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
