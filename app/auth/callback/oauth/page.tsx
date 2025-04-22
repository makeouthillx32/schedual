"use client";

import { useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function OAuthCallback() {
  const supabase = useSupabaseClient();

  useEffect(() => {
    (async () => {
      // 1. Store the session
      const { error } = await supabase.auth.getSession();
      if (error) console.error("OAuth session error:", error.message);

      // 2. Extract invite code from query string
      const urlParams = new URLSearchParams(window.location.search);
      const invite = urlParams.get("invite");

      // 3. If invite exists, apply role via Supabase admin
      if (invite) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: inviteData, error: inviteError } = await supabase
            .from("invites")
            .select("role")
            .eq("code", invite)
            .single();

          if (!inviteError && inviteData?.role) {
            await supabase.auth.admin.updateUserById(user.id, {
              user_metadata: { role: inviteData.role },
            });

            await supabase.from("invites").delete().eq("code", invite);
          }
        }
      }

      // 4. Determine where to go next
      const raw = document.cookie
        .split("; ")
        .find((c) => c.startsWith("lastPage="));

      const lastPage = raw ? decodeURIComponent(raw.split("=")[1]) : "/";
      const target =
        !lastPage || lastPage.startsWith("/auth/callback") ? "/" : lastPage;

      // 5. Hard redirect
      window.location.href = target;
    })();
  }, [supabase]);

  return (
    <p className="p-10 text-center text-sm text-gray-600 dark:text-gray-300">
      Completing&nbsp;sign‑in…
    </p>
  );
}