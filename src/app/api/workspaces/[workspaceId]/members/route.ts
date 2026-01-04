import { createClient } from "@/lib/db/supabase-server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["member", "admin"]),
});

/**
 * GET /api/workspaces/[workspaceId]/members
 * List all members of a workspace
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
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

    // Fetch all workspace members with user details
    const { data: members, error } = await supabaseAdmin
      .from("workspace_members")
      .select(
        `
        user_id,
        role,
        users (
          email,
          name
        )
      `
      )
      .eq("workspace_id", workspaceId);

    if (error) {
      console.error("Failed to fetch workspace members:", error);
      return NextResponse.json(
        { error: "Failed to fetch members" },
        { status: 500 }
      );
    }

    return NextResponse.json({ members: members || [] });
  } catch (error) {
    console.error("Workspace members fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces/[workspaceId]/members
 * Invite a new member to the workspace
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is admin or owner of this workspace
    const { data: member } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .single();

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      return NextResponse.json(
        { error: "Only owners and admins can invite members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = InviteMemberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, role } = validation.data;

    // Check if user is already a member
    const { data: existingMember } = await supabaseAdmin
      .from("workspace_members")
      .select("user_id, users(email)")
      .eq("workspace_id", workspaceId);

    if (
      existingMember?.some(
        (m: any) => m.users?.email?.toLowerCase() === email.toLowerCase()
      )
    ) {
      return NextResponse.json(
        { error: "User is already a member of this workspace" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabaseAdmin
      .from("workspace_invitations")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("email", email.toLowerCase())
      .is("accepted_at", null)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }

    // Create invitation token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const { error: inviteError } = await supabaseAdmin
      .from("workspace_invitations")
      .insert({
        id: crypto.randomUUID(),
        workspace_id: workspaceId,
        email: email.toLowerCase(),
        role,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (inviteError) {
      console.error("Failed to create invitation:", inviteError);
      return NextResponse.json(
        { error: "Failed to send invitation" },
        { status: 500 }
      );
    }

    // TODO: Send email (for MVP, just console.log)
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${token}`;
    console.log(`Invitation link: ${inviteUrl}`);
    console.log(`Invited ${email} to workspace ${workspaceId} as ${role}`);

    return NextResponse.json({
      success: true,
      message: "Invitation sent (check server logs for invite link)",
      inviteUrl, // Return URL for MVP (remove in production with real email)
    });
  } catch (error) {
    console.error("Workspace invitation error:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
