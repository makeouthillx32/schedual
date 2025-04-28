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
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const invite = urlParams.get("invite");

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (user && invite) {
        // 1. Attach invite to metadata (optional but good)
        await supabase.auth.updateUser({
          data: { invite },
        });

        // 2. Lookup the invite
        const { data: inviteData, error: inviteError } = await supabase
          .from("invites")
          .select("role_id")
          .eq("code", invite)
          .maybeSingle();

        if (!inviteError && inviteData?.role_id) {
          // 3. Update profile role
          await supabase
            .from("profiles")
            .update({ role: inviteData.role_id })
            .eq("id", user.id);

          // 4. Delete invite after use
          await supabase
            .from("invites")
            .delete()
            .eq("code", invite);
        }

        // 5. Clean up metadata (remove invite)
        await supabase.auth.updateUser({
          data: { invite: null },
        });
      }

      // 6. Redirect to home/dashboard
      window.location.href = "/CMS";
    })();
  }, [supabase]);

  return (
    <p className="p-10 text-center text-sm text-gray-600 dark:text-gray-300">
      Completing&nbsp;sign‑in…
    </p>
  );
}