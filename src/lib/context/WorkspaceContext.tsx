/**
 * Workspace Context Provider
 *
 * Manages workspace state across the application:
 * - List of workspaces the user is a member of
 * - Active workspace (stored in localStorage)
 * - Switch workspace functionality
 * - Refresh workspaces functionality
 *
 * Usage:
 * ```typescript
 * import { useWorkspace } from '@/lib/context/WorkspaceContext';
 *
 * function MyComponent() {
 *   const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();
 *   // ...
 * }
 * ```
 */

"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/db/supabase-client";

type Workspace = {
  id: string;
  name: string;
  role: string;
};

type WorkspaceContextType = {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  switchWorkspace: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
  isLoading: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setWorkspaces([]);
        setActiveWorkspace(null);
        return;
      }

      // Fetch workspace memberships with workspace details
      const { data: members, error } = await supabase
        .from("workspace_members")
        .select(
          `
          workspace_id,
          role,
          workspaces (
            id,
            name
          )
        `
        )
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to fetch workspaces:", error);
        return;
      }

      const workspacesList: Workspace[] =
        members?.map((m: any) => ({
          id: m.workspace_id,
          name: m.workspaces.name,
          role: m.role,
        })) || [];

      setWorkspaces(workspacesList);

      // Set active workspace from localStorage or default to first
      const savedWorkspaceId =
        typeof window !== "undefined"
          ? localStorage.getItem("activeWorkspaceId")
          : null;
      const active =
        workspacesList.find((w) => w.id === savedWorkspaceId) ||
        workspacesList[0] ||
        null;

      setActiveWorkspace(active);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      setActiveWorkspace(workspace);
      if (typeof window !== "undefined") {
        localStorage.setItem("activeWorkspaceId", workspaceId);
      }
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        switchWorkspace,
        refreshWorkspaces: fetchWorkspaces,
        isLoading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
};
