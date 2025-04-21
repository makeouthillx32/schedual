"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function OAuthCallbackPage() {
  const supabase = useSupabaseClient();
  const router   = useRouter();

  useEffect(() => {
    (async () => {
      // 1 · store the session tokens in localStorage
      await supabase.auth.getSession();

      // 2 · read lastPage = pathname we saved in a cookie
      const lastPageCookie = document.cookie
        .split("; ")
        .find(c => c.startsWith("lastPage="));

      // decode URI component because cookies are URL‑encoded
      const lastPage = lastPageCookie
        ? decodeURIComponent(lastPageCookie.split("=")[1])
        : "/";                     // fallback

      // 3 · navigate there and remove the hash / query
      router.replace(lastPage);
    })();
  }, [router, supabase]);

  return (
    <p className="p-10 text-center">
      Completing sign‑in&nbsp;…
    </p>
  );
}
