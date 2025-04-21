"use client";

import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function SignInWithGoogle() {
  const supabase = useSupabaseClient();

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?refresh=true`, // ✅ force session re-check
      },
    });

    if (error) {
      console.error("Google sign-in error:", error.message);
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
