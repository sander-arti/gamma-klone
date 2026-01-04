import { createClient } from "@/lib/db/supabase-server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { createSampleDeck } from "@/lib/onboarding/create-sample-deck";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = SignupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;

    const supabase = await createClient();

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || null,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: "User creation failed" }, { status: 500 });
    }

    // Create default workspace using service role (bypasses RLS)
    const workspaceName = name ? `${name}'s Workspace` : `${email}'s Workspace`;
    const { data: workspace, error: workspaceError } = await supabaseAdmin
      .from("workspaces")
      .insert({
        id: crypto.randomUUID(),
        name: workspaceName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (workspaceError || !workspace) {
      console.error("Failed to create workspace:", workspaceError);
      // Don't fail signup if workspace creation fails - user can create one later
    }

    // Add user as owner of the workspace
    if (workspace) {
      const { error: memberError } = await supabaseAdmin.from("workspace_members").insert({
        id: crypto.randomUUID(),
        user_id: data.user.id,
        workspace_id: workspace.id,
        role: "owner",
        created_at: new Date().toISOString(),
      });

      if (memberError) {
        console.error("Failed to add workspace member:", memberError);
      }

      // Create sample deck (non-blocking - signup succeeds even if this fails)
      createSampleDeck(data.user.id, workspace.id)
        .then((result) => {
          if (!result.success) {
            console.warn("[signup] Sample deck creation failed:", result.error);
          } else {
            console.log("[signup] Sample deck created:", result.deckId);
          }
        })
        .catch((err) => {
          console.warn("[signup] Sample deck creation error:", err);
        });
    }

    // Create user record in users table (using service role)
    const { error: userRecordError } = await supabaseAdmin.from("users").insert({
      id: data.user.id,
      email: data.user.email!,
      name: name || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (userRecordError) {
      console.error("Failed to create user record:", userRecordError);
      // Don't fail signup - auth.users already has the user
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: name || null,
      },
      workspace: workspace
        ? {
            id: workspace.id,
            name: workspace.name,
          }
        : null,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
