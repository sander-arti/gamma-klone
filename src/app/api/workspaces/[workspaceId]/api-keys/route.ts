import { createClient } from "@/lib/db/supabase-server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { generateApiKey } from "@/lib/api/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateApiKeySchema = z.object({
  name: z.string().min(1, "API key name is required"),
  expiresIn: z.enum(["never", "30d", "90d", "1y"]).default("never"),
});

/**
 * GET /api/workspaces/[workspaceId]/api-keys
 * List all API keys for a workspace
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

    // Fetch API keys (using admin client to bypass RLS)
    const { data: keys, error } = await supabaseAdmin
      .from("api_keys")
      .select("id, name, prefix, created_at, last_used_at, expires_at")
      .eq("workspace_id", workspaceId)
      .is("revoked_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch API keys:", error);
      return NextResponse.json(
        { error: "Failed to fetch API keys" },
        { status: 500 }
      );
    }

    return NextResponse.json({ keys: keys || [] });
  } catch (error) {
    console.error("API keys fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces/[workspaceId]/api-keys
 * Create a new API key
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

    const body = await request.json();
    const validation = CreateApiKeySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, expiresIn } = validation.data;

    // Generate API key
    const { key, hash, prefix } = generateApiKey();

    // Calculate expiration date
    let expiresAt: string | null = null;
    if (expiresIn !== "never") {
      const days = expiresIn === "30d" ? 30 : expiresIn === "90d" ? 90 : 365;
      expiresAt = new Date(
        Date.now() + days * 24 * 60 * 60 * 1000
      ).toISOString();
    }

    // Store API key (using admin client)
    const { data: apiKey, error } = await supabaseAdmin
      .from("api_keys")
      .insert({
        id: crypto.randomUUID(),
        workspace_id: workspaceId,
        name,
        key_hash: hash,
        prefix,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      })
      .select("id, name, prefix, created_at, expires_at")
      .single();

    if (error) {
      console.error("Failed to create API key:", error);
      return NextResponse.json(
        { error: "Failed to create API key" },
        { status: 500 }
      );
    }

    // Return the full key (only shown once) + metadata
    return NextResponse.json({
      key, // Full key - show to user once
      apiKey, // Metadata
    });
  } catch (error) {
    console.error("API key creation error:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
