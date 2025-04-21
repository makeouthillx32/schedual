"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  useEffect(() => {
    const run = async () => {
      // Try exchanging code (works for PKCE and standard OAuth)
      const { data, error } = await supabase.auth.exchangeCodeForSession();

      if (error) {
        console.error("Error exchanging OAuth code:", error.message);
      } else {
        console.log("Session set:", data.session);
      }

      // Redirect to lastPage or fallback
      const lastPage = document.cookie
        .split("; ")
        .find((c) => c.startsWith("lastPage="))
        ?.split("=")[1] || "/";

      router.replace(lastPage);
    };

    run();
  }, [supabase, router]);

  return <p className="p-10 text-center">Completing sign-in...</p>;
}