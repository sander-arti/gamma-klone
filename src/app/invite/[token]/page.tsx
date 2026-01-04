import { createClient } from "@/lib/db/supabase-server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { redirect } from "next/navigation";
import crypto from "crypto";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    return redirect(`/login?redirect=/invite/${token}`);
  }

  // Get invitation
  const { data: invitation, error: invitationError } = await supabaseAdmin
    .from("workspace_invitations")
    .select("id, workspace_id, email, role, expires_at, workspaces(name)")
    .eq("token", token)
    .is("accepted_at", null)
    .single();

  // Check if invitation exists and is valid
  if (invitationError || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Invitation Not Found
          </h1>
          <p className="text-gray-600 text-center mb-6">
            This invitation link is invalid or has already been used.
          </p>
          <a
            href="/dashboard"
            className="block w-full px-4 py-2 bg-emerald-600 text-white text-center rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Check if invitation has expired
  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Invitation Expired</h1>
          <p className="text-gray-600 text-center mb-6">
            This invitation link has expired. Please contact the workspace owner for a new
            invitation.
          </p>
          <a
            href="/dashboard"
            className="block w-full px-4 py-2 bg-emerald-600 text-white text-center rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Check if user email matches invitation email
  if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Email Mismatch</h1>
          <p className="text-gray-600 text-center mb-4">
            This invitation is for <strong>{invitation.email}</strong>
          </p>
          <p className="text-gray-600 text-center mb-6">
            You are currently logged in as <strong>{user.email}</strong>
          </p>
          <p className="text-sm text-gray-500 text-center mb-6">
            Please log out and sign in with the invited email address.
          </p>
          <a
            href="/dashboard"
            className="block w-full px-4 py-2 bg-emerald-600 text-white text-center rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Check if user is already a member
  const { data: existingMembership } = await supabaseAdmin
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", invitation.workspace_id)
    .eq("user_id", user.id)
    .single();

  if (existingMembership) {
    // Already a member, mark invitation as accepted and redirect
    await supabaseAdmin
      .from("workspace_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);

    return redirect("/dashboard");
  }

  // Add user to workspace
  const { error: membershipError } = await supabaseAdmin.from("workspace_members").insert({
    id: crypto.randomUUID(),
    workspace_id: invitation.workspace_id,
    user_id: user.id,
    role: invitation.role,
  });

  if (membershipError) {
    console.error("Failed to add workspace member:", membershipError);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Error</h1>
          <p className="text-gray-600 text-center mb-6">
            Failed to accept invitation. Please try again later.
          </p>
          <a
            href="/dashboard"
            className="block w-full px-4 py-2 bg-emerald-600 text-white text-center rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Mark invitation as accepted
  await supabaseAdmin
    .from("workspace_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  // Success - redirect to dashboard
  return redirect("/dashboard");
}
