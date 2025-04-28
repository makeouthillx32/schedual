"use client";

import { useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function CompleteSignup() {
  const supabase = useSupabaseClient();

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.error("No user found in session");
        return;
      }

      const user = userData.user;
      const urlParams = new URLSearchParams(window.location.search);
      const invite = urlParams.get("invite");

      // 1. Insert profile if missing
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id: user.id,
          role: 'anonymous', // default role
        });
      }

      // 2. Apply invite role if invite exists
      if (invite) {
        const { data: inviteData, error: inviteError } = await supabase
          .from("invites")
          .select("role_id")
          .eq("code", invite)
          .maybeSingle();

        if (!inviteError && inviteData?.role_id) {
          await supabase.from("profiles")
            .update({ role: inviteData.role_id })
            .eq("id", user.id);

          await supabase.from("invites").delete().eq("code", invite);
        }
      }

      // 3. Redirect to dashboard
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