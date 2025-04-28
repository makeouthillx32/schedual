"use client";

import { useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function OAuthCallback() {
  const supabase = useSupabaseClient();

  useEffect(() => {
    (async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("OAuth session error:", sessionError.message);
      }

      const urlParams = new URLSearchParams(window.location.search);
      const invite = urlParams.get("invite");

      if (invite && session?.user) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { invite },
        });

        if (updateError) {
          console.error("Failed to attach invite:", updateError.message);
        }
      }

      // Redirect to server-side /auth/callback route to apply invite role
      window.location.href = "/auth/callback";
    })();
  }, [supabase]);

  return (
    <p className="p-10 text-center text-sm text-gray-600 dark:text-gray-300">
      Completing&nbsp;sign‑in…
    </p>
  );
}
