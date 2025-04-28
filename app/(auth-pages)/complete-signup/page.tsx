"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function CompleteSignup() {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      // Wait for the session to be ready
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        console.log("User not ready yet, retrying in 2 seconds...");
        setTimeout(run, 2000);
        return;
      }

      const user = userData.user;
      const urlParams = new URLSearchParams(window.location.search);
      const invite = urlParams.get("invite");

      // 1. Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id: user.id,
          role: 'anonymous',
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

      // 3. Redirect after everything
      const raw = document.cookie
        .split("; ")
        .find((c) => c.startsWith("lastPage="));
      const lastPage = raw ? decodeURIComponent(raw.split("=")[1]) : "/";
      const target = !lastPage || lastPage.startsWith("/auth/callback") ? "/" : lastPage;

      window.location.href = target;
    };

    run();
  }, [supabase]);

  return (
    <p className="p-10 text-center text-sm text-gray-600 dark:text-gray-300">
      Completing&nbsp;sign‑in…
    </p>
  );
}