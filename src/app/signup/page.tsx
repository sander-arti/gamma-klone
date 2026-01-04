/**
 * Signup Page
 *
 * User registration with email/password and social login options.
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthLayout, AuthForm, SocialLogin } from "@/components/auth";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (data: {
    email: string;
    password: string;
    name?: string;
  }) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Signup failed");
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kunne ikke opprette konto. Prøv igjen."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log("Google signup clicked");
  };

  const handleMicrosoftLogin = () => {
    // TODO: Implement Microsoft OAuth
    console.log("Microsoft signup clicked");
  };

  return (
    <AuthLayout
      title="Opprett konto"
      subtitle="Kom i gang med ARTI Slides gratis"
    >
      {/* Social login */}
      <SocialLogin
        onGoogleClick={handleGoogleLogin}
        onMicrosoftClick={handleMicrosoftLogin}
        disabled={isLoading}
      />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">eller</span>
        </div>
      </div>

      {/* Email/password form */}
      <AuthForm
        mode="signup"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Har du allerede en konto?{" "}
        <Link
          href="/login"
          className="font-medium text-emerald-600 hover:text-emerald-700"
        >
          Logg inn
        </Link>
      </p>
    </AuthLayout>
  );
}
