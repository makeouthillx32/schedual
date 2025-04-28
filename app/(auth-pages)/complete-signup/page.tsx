"use client";

import { useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function CompleteSignup() {
  const supabase = useSupabaseClient();

  useEffect(() => {
    const run = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        console.log("User not ready, retrying...");
        setTimeout(run, 2000);
        return;
      }

      const user = userData.user;
      const urlParams = new URLSearchParams(window.location.search);
      const invite = urlParams.get("invite");

      // ✅ Call the server API to complete signup
      const res = await fetch("/api/profile/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, inviteCode: invite }),
      });

      if (!res.ok) {
        console.error("[complete-signup] API error:", await res.text());
      } else {
        console.log("[complete-signup] Profile created successfully.");
      }

      // ✅ Then redirect
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