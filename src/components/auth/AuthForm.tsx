/**
 * AuthForm Component
 *
 * Reusable form for login and signup.
 * Handles email/password input with validation feedback.
 */

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

interface AuthFormProps {
  mode: "login" | "signup";
  onSubmit?: (data: { email: string; password: string; name?: string }) => void;
  isLoading?: boolean;
  error?: string;
}

export function AuthForm({ mode, onSubmit, isLoading = false, error }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.({ email, password, name: mode === "signup" ? name : undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Name field (signup only) */}
      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Navn
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ditt navn"
            required
            disabled={isLoading}
            className="
              w-full px-4 py-3 rounded-xl
              border border-gray-200
              text-gray-900 placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          />
        </div>
      )}

      {/* Email field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          E-post
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="din@epost.no"
          required
          disabled={isLoading}
          className="
            w-full px-4 py-3 rounded-xl
            border border-gray-200
            text-gray-900 placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          "
        />
      </div>

      {/* Password field */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Passord
          </label>
          {mode === "login" && (
            <Link
              href="/forgot-password"
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              Glemt passord?
            </Link>
          )}
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "signup" ? "Minst 8 tegn" : "Ditt passord"}
          required
          minLength={mode === "signup" ? 8 : undefined}
          disabled={isLoading}
          className="
            w-full px-4 py-3 rounded-xl
            border border-gray-200
            text-gray-900 placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          "
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="
          w-full py-3 px-4 rounded-xl
          bg-emerald-600 text-white font-semibold
          hover:bg-emerald-700
          focus:outline-none focus:ring-2 focus:ring-emerald-500/50
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
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
            Vennligst vent...
          </span>
        ) : mode === "login" ? (
          "Logg inn"
        ) : (
          "Opprett konto"
        )}
      </button>

      {/* Terms (signup only) */}
      {mode === "signup" && (
        <p className="text-xs text-gray-500 text-center">
          Ved a opprette en konto godtar du vare{" "}
          <Link href="/terms" className="text-emerald-600 hover:underline">
            brukervilkar
          </Link>{" "}
          og{" "}
          <Link href="/privacy" className="text-emerald-600 hover:underline">
            personvernerklaering
          </Link>
          .
        </p>
      )}
    </form>
  );
}
