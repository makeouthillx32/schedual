"use client";

import { useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function OAuthCallback() {
  const supabase = useSupabaseClient();

  useEffect(() => {
    (async () => {
      const { error: sessionError } = await supabase.auth.getSession();
      if (sessionError) console.error("OAuth session error:", sessionError.message);

      const urlParams = new URLSearchParams(window.location.search);
      const invite = urlParams.get("invite");

      if (invite) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await supabase.auth.updateUser({
            data: { invite },
          });
        }
      }

      const raw = document.cookie
        .split("; ")
        .find((c) => c.startsWith("lastPage="));
      const lastPage = raw ? decodeURIComponent(raw.split("=")[1]) : "/";
      const target = !lastPage || lastPage.startsWith("/auth/callback") ? "/" : lastPage;

      window.location.href = target;
    })();
  }, [supabase]);

  return (
    <p className="p-10 text-center text-sm text-gray-600 dark:text-gray-300">
      Completing&nbsp;sign‑in…
    </p>
  );
}