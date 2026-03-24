// hooks/usePushNotifications.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";

// Your VAPID public key — generate with:
//   npx web-push generate-vapid-keys
// Then add NEXT_PUBLIC_VAPID_PUBLIC_KEY to .env
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export type PushState = "unsupported" | "denied" | "default" | "granted" | "subscribed" | "loading";

export function usePushNotifications() {
  const [state, setState] = useState<PushState>("loading");
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ── Check current state on mount ─────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }

    const perm = Notification.permission;
    if (perm === "denied") { setState("denied"); return; }

    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setState(sub ? "subscribed" : perm === "granted" ? "granted" : "default");
      });
    }).catch(() => setState("default"));
  }, []);

  // ── Register service worker ───────────────────────────────────────────────
  const registerSW = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;
      return reg;
    } catch (err) {
      console.error("[Push] SW registration failed:", err);
      setError("Service worker registration failed.");
      return null;
    }
  }, []);

  // ── Request permission + subscribe ───────────────────────────────────────
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!VAPID_PUBLIC_KEY) {
      setError("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set.");
      return false;
    }

    setState("loading");
    setError(null);

    try {
      const reg = await registerSW();
      if (!reg) return false;

      // Ask for permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        setError("Notification permission denied.");
        return false;
      }

      // Subscribe to push
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const json = subscription.toJSON();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Save subscription to Supabase
      const { error: dbErr } = await supabase.from("push_subscriptions").upsert(
        {
          user_id:     user?.id ?? null,
          endpoint:    json.endpoint!,
          p256dh:      json.keys!.p256dh,
          auth:        json.keys!.auth,
          user_agent:  navigator.userAgent,
          last_used_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" }
      );

      if (dbErr) throw dbErr;

      setState("subscribed");
      console.log("[Push] ✅ Subscribed successfully");
      return true;

    } catch (err) {
      console.error("[Push] Subscribe failed:", err);
      setError(err instanceof Error ? err.message : "Failed to subscribe.");
      setState("default");
      return false;
    }
  }, [registerSW, supabase]);

  // ── Unsubscribe ───────────────────────────────────────────────────────────
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return true;

      await sub.unsubscribe();

      // Remove from Supabase
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", sub.endpoint);

      setState("granted");
      return true;
    } catch (err) {
      console.error("[Push] Unsubscribe failed:", err);
      return false;
    }
  }, [supabase]);

  return { state, error, subscribe, unsubscribe };
}