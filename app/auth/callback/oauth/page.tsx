"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function OAuthCallback() {
  const supabase = useSupabaseClient();
  const router   = useRouter();

  useEffect(() => {
    (async () => {
      // 1.  Pick tokens out of the URL (#access_token=… or ?code=…)
      const { error } = await supabase.auth.getSession();
      if (error) console.error("OAuth session error:", error.message);

      // 2.  Read last‑page cookie the server set earlier
      const lastPage =
        document.cookie
          .split("; ")
          .find((c) => c.startsWith("lastPage="))
          ?.split("=")[1] || "/";

      // 3.  Strip tokens from the address bar and navigate
      router.replace(lastPage);
    })();
  }, [supabase, router]);

  return <p className="p-6 text-center">Completing sign‑in…</p>;
}
