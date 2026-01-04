/**
 * Login Page
 *
 * User login with email/password and social login options.
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthLayout, AuthForm, SocialLogin } from "@/components/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login failed");
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Feil e-post eller passord. Prøv igjen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log("Google login clicked");
  };

  const handleMicrosoftLogin = () => {
    // TODO: Implement Microsoft OAuth
    console.log("Microsoft login clicked");
  };

  return (
    <AuthLayout title="Velkommen tilbake" subtitle="Logg inn på kontoen din for å fortsette">
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
      <AuthForm mode="login" onSubmit={handleSubmit} isLoading={isLoading} error={error} />

      {/* Sign up link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Har du ikke en konto?{" "}
        <Link href="/signup" className="font-medium text-emerald-600 hover:text-emerald-700">
          Opprett konto
        </Link>
      </p>
    </AuthLayout>
  );
}
