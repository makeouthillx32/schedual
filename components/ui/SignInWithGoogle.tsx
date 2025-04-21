"use client";

import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function SignInWithGoogle() {
  const supabase = useSupabaseClient();

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // ⬇️  Send Google back to the client callback page we created
        redirectTo: `${location.origin}/auth/callback`,
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
