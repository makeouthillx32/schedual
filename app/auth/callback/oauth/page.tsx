"use client";

import { useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function OAuthCallback() {
  const supabase = useSupabaseClient();

  useEffect(() => {
    (async () => {
      /* 1 · Store the session (implicit hash flow) */
      const { error } = await supabase.auth.getSession();
      if (error) console.error("OAuth session error:", error.message);

      /* 2 · Retrieve lastPage cookie; fall back to "/" */
      const raw = document.cookie
        .split("; ")
        .find(c => c.startsWith("lastPage="));

      const lastPage = raw ? decodeURIComponent(raw.split("=")[1]) : "/";
      const target =
        !lastPage || lastPage.startsWith("/auth/callback") ? "/" : lastPage;

      /* 3 · Hard‑redirect so we leave the spinner page */
      window.location.href = target;
    })();
  }, [supabase]);

  return (
    <p className="p-10 text-center">
      Completing&nbsp;sign‑in…
    </p>
  );
}
