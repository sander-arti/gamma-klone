/**
 * ShareModal Component
 *
 * Modal for generating and managing share links for decks.
 */

"use client";

import { useState } from "react";
import { Modal, Button, useToast } from "@/components/ui";
import { useShare } from "@/lib/hooks";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: string;
}

export function ShareModal({ isOpen, onClose, deckId }: ShareModalProps) {
  const { shareUrl, isSharing, isLoading, error, generateLink, revokeLink, copyToClipboard } =
    useShare(deckId);
  const { addToast } = useToast();
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  const handleGenerateLink = async () => {
    const success = await generateLink();
    if (success) {
      addToast({ type: "success", message: "Delingslenke opprettet!" });
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard();
    if (success) {
      addToast({ type: "success", message: "Lenke kopiert til utklippstavle!" });
    } else {
      addToast({ type: "error", message: "Kunne ikke kopiere lenke" });
    }
  };

  const handleRevoke = async () => {
    const success = await revokeLink();
    if (success) {
      addToast({ type: "info", message: "Deling deaktivert" });
      setShowRevokeConfirm(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Del presentasjon"
      description={
        isSharing
          ? "Alle med lenken kan se presentasjonen."
          : "Opprett en delingslenke som andre kan bruke for å se presentasjonen."
      }
      size="md"
    >
      <div className="space-y-4">
        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Not sharing state */}
        {!isSharing && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Presentasjonen er privat. Opprett en lenke for å dele den med andre.
            </p>
            <Button onClick={handleGenerateLink} disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Oppretter...
                </>
              ) : (
                "Opprett delingslenke"
              )}
            </Button>
          </div>
        )}

        {/* Sharing state */}
        {isSharing && shareUrl && (
          <>
            {/* Share URL display */}
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button onClick={handleCopy} variant="secondary">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Kopier
              </Button>
            </div>

            {/* Access info */}
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-green-700">
                Alle med denne lenken kan se presentasjonen
              </span>
            </div>

            {/* Revoke access */}
            {!showRevokeConfirm ? (
              <button
                onClick={() => setShowRevokeConfirm(true)}
                className="text-sm text-red-600 hover:text-red-700 hover:underline"
              >
                Fjern tilgang
              </button>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 mb-3">
                  Er du sikker? Lenken vil slutte å fungere umiddelbart.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleRevoke}
                    disabled={isLoading}
                  >
                    {isLoading ? "Fjerner..." : "Ja, fjern tilgang"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRevokeConfirm(false)}
                    disabled={isLoading}
                  >
                    Avbryt
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
