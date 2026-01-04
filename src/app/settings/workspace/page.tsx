/**
 * Workspace Settings Page
 *
 * Manage workspace name and delete workspace.
 * Only owners can delete, owners and admins can rename.
 */

"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/lib/context/WorkspaceContext";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function WorkspaceSettingsPage() {
  const { activeWorkspace, refreshWorkspaces } = useWorkspace();
  const router = useRouter();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name);
    }
  }, [activeWorkspace]);

  const handleSave = async () => {
    if (!activeWorkspace) return;

    setIsLoading(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update workspace");
      }

      await refreshWorkspaces();
      setSuccess("Workspace updated successfully");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update workspace"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activeWorkspace) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${activeWorkspace.name}"? This action cannot be undone and will delete all presentations, files, and data associated with this workspace.`
    );

    if (!confirmed) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete workspace");
      }

      // Redirect to dashboard after deletion
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete workspace"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeWorkspace) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Workspace Settings</h1>
        <p className="text-gray-600">No active workspace selected.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Workspace Settings
      </h1>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-600">{success}</p>
        </div>
      )}

      {/* Workspace name */}
      <div className="mb-8">
        <label
          htmlFor="workspace-name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Workspace Name
        </label>
        <input
          id="workspace-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        <p className="mt-2 text-xs text-gray-500">
          Your role: <span className="font-medium">{activeWorkspace.role}</span>
        </p>
        <button
          onClick={handleSave}
          disabled={
            isLoading ||
            name === activeWorkspace.name ||
            name.trim().length === 0
          }
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Danger zone */}
      {activeWorkspace.role === "owner" && (
        <div className="pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Danger Zone
          </h2>
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  Delete Workspace
                </h3>
                <p className="text-sm text-gray-600">
                  Permanently delete this workspace and all its data. This
                  action cannot be undone.
                </p>
              </div>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ml-4"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
