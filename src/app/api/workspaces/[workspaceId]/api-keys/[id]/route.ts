import { createClient } from "@/lib/db/supabase-server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/workspaces/[workspaceId]/api-keys/[id]
 * Revoke an API key
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; id: string }> }
) {
  try {
    const { workspaceId, id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is member of this workspace
    const { data: member } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .single();

    if (!member) {
      return NextResponse.json(
        { error: "Not a member of this workspace" },
        { status: 403 }
      );
    }

    // Revoke API key by setting revoked_at (using admin client)
    const { error } = await supabaseAdmin
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id)
      .eq("workspace_id", workspaceId);

    if (error) {
      console.error("Failed to revoke API key:", error);
      return NextResponse.json(
        { error: "Failed to revoke API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API key revocation error:", error);
    return NextResponse.json(
      { error: "Failed to revoke API key" },
      { status: 500 }
    );
  }
}
