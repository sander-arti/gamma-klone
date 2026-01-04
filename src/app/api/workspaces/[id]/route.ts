import { createClient } from "@/lib/db/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
});

/**
 * PATCH /api/workspaces/[id]
 * Update workspace name
 * Only owners and admins can update
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = UpdateWorkspaceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    // Check if user is owner or admin of this workspace
    const { data: member } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", id)
      .eq("user_id", user.id)
      .single();

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      return NextResponse.json(
        { error: "Only owners and admins can update workspace" },
        { status: 403 }
      );
    }

    // Update workspace name
    const { error } = await supabase
      .from("workspaces")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Workspace update error:", error);
    return NextResponse.json(
      { error: "Failed to update workspace" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workspaces/[id]
 * Delete workspace
 * Only owners can delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is owner of this workspace
    const { data: member } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", id)
      .eq("user_id", user.id)
      .single();

    if (!member || member.role !== "owner") {
      return NextResponse.json(
        { error: "Only owners can delete workspace" },
        { status: 403 }
      );
    }

    // Delete workspace (cascade will delete all related data via FK constraints)
    const { error } = await supabase
      .from("workspaces")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Workspace delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete workspace" },
      { status: 500 }
    );
  }
}
