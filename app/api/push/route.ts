// app/api/push/route.ts
// Two notification paths:
//   type: "new_order"    → all subscriptions (new delivery/pickup submitted by cashier)
//   type: "driver_alert" → specific user_id only (targeted driver alert)

import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

function getWebPush() {
  const pubKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privKey = process.env.VAPID_PRIVATE_KEY;
  if (pubKey && privKey) {
    try {
      webpush.setVapidDetails(
        "mailto:kaitlyn@dartcommercialservices.com",
        pubKey,
        privKey
      );
    } catch (e) {
      console.warn("webpush.setVapidDetails failed:", e);
    }
  }
  return webpush;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder";
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      body:    msgBody = "",
      url    = "/Delivery",
      tag    = "dart-delivery",
      type   = "general",
      user_id,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const pushClient = getWebPush();
    const supabase = getSupabase();

    // new_order / general → all subscriptions
    // driver_alert + user_id → only that user
    let query = supabase.from("push_subscriptions").select("*");
    if (type === "driver_alert" && user_id) {
      query = query.eq("user_id", user_id);
    }

    const { data: subs, error: dbErr } = await query;
    if (dbErr) throw dbErr;
    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0, message: "No subscriptions found", type });
    }

    const payload = JSON.stringify({ title, body: msgBody, url, tag, type });

    const results = await Promise.allSettled(
      subs.map((sub) =>
        pushClient
          .sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          )
          .then(async () => {
            await supabase
              .from("push_subscriptions")
              .update({ last_used_at: new Date().toISOString() })
              .eq("endpoint", sub.endpoint);
          })
          .catch(async (err: any) => {
            if (err.statusCode === 410) {
              await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
            }
            throw err;
          })
      )
    );

    return NextResponse.json({
      sent:   results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
      total:  subs.length,
      type,
    });

  } catch (err) {
    console.error("[Push API]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}