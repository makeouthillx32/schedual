"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  useEffect(() => {
    const run = async () => {
      // Just call getSession – Supabase automatically extracts tokens from hash
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("OAuth session error:", error.message);
      } else {
        console.log("Session retrieved:", data.session);
      }

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