"use client";

import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

export default function SignInWithGoogle() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google"
      // No `redirectTo` unless you're using a custom callback URL
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
