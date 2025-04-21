"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function OAuthCallbackPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const completeOAuth = async () => {
      await supabase.auth.getSession(); // triggers Supabase to store the session

      const lastPage = document.cookie
        .split("; ")
        .find((c) => c.startsWith("lastPage="))
        ?.split("=")[1] || "/";

      router.replace(lastPage);
    };

    completeOAuth();
  }, [router, supabase]);

  return <p className="p-10 text-center">Completing sign-in...</p>;
}