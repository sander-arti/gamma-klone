/**
 * useShare Hook
 *
 * React hook for managing deck sharing.
 * Handles generating, revoking, and copying share links.
 */

import { useState, useCallback, useEffect } from "react";

interface ShareState {
  shareUrl: string | null;
  shareToken: string | null;
  shareAccess: "private" | "anyone_with_link_can_view";
}

interface UseShareReturn {
  /** Current share URL (null if not shared) */
  shareUrl: string | null;
  /** Whether the deck is currently shared */
  isSharing: boolean;
  /** Loading state for API calls */
  isLoading: boolean;
  /** Error message from last failed operation */
  error: string | null;
  /** Generate a new share link */
  generateLink: () => Promise<boolean>;
  /** Revoke the current share link */
  revokeLink: () => Promise<boolean>;
  /** Copy the share URL to clipboard */
  copyToClipboard: () => Promise<boolean>;
  /** Refresh current share status */
  refresh: () => Promise<void>;
}

/**
 * Hook for managing deck sharing
 *
 * @param deckId - The deck ID to manage sharing for
 */
export function useShare(deckId: string): UseShareReturn {
  const [state, setState] = useState<ShareState>({
    shareUrl: null,
    shareToken: null,
    shareAccess: "private",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current share status on mount
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/decks/${deckId}/share`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message ?? "Kunne ikke hente delingsstatus");
        return;
      }

      setState({
        shareUrl: data.shareUrl,
        shareToken: data.shareToken,
        shareAccess: data.shareAccess,
      });
    } catch (err) {
      console.error("useShare refresh error:", err);
      setError("Nettverksfeil ved henting av delingsstatus");
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  // Load initial state
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Generate a new share link
  const generateLink = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/decks/${deckId}/share`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message ?? "Kunne ikke generere delingslenke");
        return false;
      }

      setState({
        shareUrl: data.shareUrl,
        shareToken: data.shareToken,
        shareAccess: data.shareAccess,
      });

      return true;
    } catch (err) {
      console.error("useShare generateLink error:", err);
      setError("Nettverksfeil ved generering av lenke");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  // Revoke the current share link
  const revokeLink = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/decks/${deckId}/share`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message ?? "Kunne ikke fjerne deling");
        return false;
      }

      setState({
        shareUrl: null,
        shareToken: null,
        shareAccess: "private",
      });

      return true;
    } catch (err) {
      console.error("useShare revokeLink error:", err);
      setError("Nettverksfeil ved fjerning av deling");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  // Copy share URL to clipboard
  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    if (!state.shareUrl) {
      setError("Ingen delingslenke å kopiere");
      return false;
    }

    try {
      await navigator.clipboard.writeText(state.shareUrl);
      return true;
    } catch (err) {
      console.error("useShare copyToClipboard error:", err);
      // Fallback for browsers that don't support clipboard API
      try {
        const textarea = document.createElement("textarea");
        textarea.value = state.shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        return true;
      } catch {
        setError("Kunne ikke kopiere til utklippstavle");
        return false;
      }
    }
  }, [state.shareUrl]);

  return {
    shareUrl: state.shareUrl,
    isSharing: state.shareAccess === "anyone_with_link_can_view",
    isLoading,
    error,
    generateLink,
    revokeLink,
    copyToClipboard,
    refresh,
  };
}
