"use client";

import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function SignInWithGoogle() {
  const supabase = useSupabaseClient();

  const handleGoogleSignIn = async () => {
    const invite = new URLSearchParams(window.location.search).get("invite");

    const redirectTo = `${location.origin}/auth/callback/oauth${invite ? `?invite=${invite}` : ""}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("Google sign‑in error:", error.message);
      alert("Google sign‑in failed – see console for details.");
    }
  };

  return (
    <button
      type="button"
      className="login-with-google-btn"
      onClick={handleGoogleSignIn}
    >
      Sign in with Google
    </button>
  );
}