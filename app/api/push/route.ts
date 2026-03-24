// app/api/push/route.ts
// POST /api/push — send a push notification to all subscriptions
// Called by the eta-checker Edge Function (or manually for testing)

import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

webpush.setVapidDetails(
  "mailto:kaitlyn@dartcommercialservices.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: msgBody, url, tag, user_id } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    // Fetch subscriptions — optionally filtered to a specific user
    let query = supabase.from("push_subscriptions").select("*");
    if (user_id) query = query.eq("user_id", user_id);

    const { data: subs, error: dbErr } = await query;
    if (dbErr) throw dbErr;
    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0, message: "No subscriptions found" });
    }

    const payload = JSON.stringify({
      title,
      body:             msgBody || "",
      url:              url || "/Delivery",
      tag:              tag || "dart-delivery",
      requireInteraction: true,
    });

    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        ).then(async () => {
          // Update last_used_at
          await supabase
            .from("push_subscriptions")
            .update({ last_used_at: new Date().toISOString() })
            .eq("endpoint", sub.endpoint);
        }).catch(async (err) => {
          // 410 Gone = subscription expired, clean it up
          if (err.statusCode === 410) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint);
          }
          throw err;
        })
      )
    );

    const sent   = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({ sent, failed, total: subs.length });

  } catch (err) {
    console.error("[Push API] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET /api/push — health check
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Push API is running" });
}