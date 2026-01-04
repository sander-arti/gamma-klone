/**
 * Workspace Switcher Component
 *
 * Dropdown for switching between workspaces.
 * Shows current workspace and allows user to switch to any workspace they're a member of.
 *
 * Usage:
 * ```typescript
 * import { WorkspaceSwitcher } from '@/components/workspace/WorkspaceSwitcher';
 *
 * function Header() {
 *   return (
 *     <div>
 *       <WorkspaceSwitcher />
 *     </div>
 *   );
 * }
 * ```
 */

"use client";

import { useWorkspace } from "@/lib/context/WorkspaceContext";
import { ChevronDown, Check } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, switchWorkspace, isLoading } = useWorkspace();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 animate-pulse">
        <span className="font-medium text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!activeWorkspace) {
    return null;
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
        <span className="font-medium text-gray-900">{activeWorkspace.name}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 min-w-[200px] z-50"
          sideOffset={5}
        >
          {workspaces.map((workspace) => (
            <DropdownMenu.Item
              key={workspace.id}
              onClick={() => switchWorkspace(workspace.id)}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none flex items-center justify-between"
            >
              <span>{workspace.name}</span>
              {workspace.id === activeWorkspace.id && (
                <Check className="w-4 h-4 text-emerald-600" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
