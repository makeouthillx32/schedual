// supabase/functions/eta-checker/index.ts
//
// Called by pg_cron every 15 minutes.
// For each pending order scheduled within the next 2 hours:
//   1. Calls Mapbox Directions API to get live drive time from thrift home
//   2. Calculates notify_at = scheduled_time - drive_minutes - buffer
//   3. If it's time to notify, inserts into notifications table + marks notified
//
// ENV vars needed (set in Supabase Dashboard → Edge Functions → Secrets):
//   MAPBOX_TOKEN          — your Mapbox public/secret token
//   SUPABASE_URL          — auto-injected by Supabase
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected by Supabase

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const THRIFT_SHOP_LNG = -117.6714;
const THRIFT_SHOP_LAT = 35.6228;
const THRIFT_SHOP_ADDRESS = "232 Sahara Dr, Ridgecrest, CA 93555";
const PACIFIC_TZ = "America/Los_Angeles";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Current time in Pacific as a Date object */
function nowPacific(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: PACIFIC_TZ }));
}

/** "2026-03-23" + "09:30:00" → Date in Pacific */
function toScheduledDate(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}`);
}

/** Geocode an address using Mapbox Geocoding API → [lng, lat] or null */
async function geocodeAddress(
  address: string,
  mapboxToken: string
): Promise<[number, number] | null> {
  const encoded = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${mapboxToken}&country=US&proximity=${THRIFT_SHOP_LNG},${THRIFT_SHOP_LAT}&limit=1`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[Geocode] Failed for "${address}": ${res.status}`);
    return null;
  }
  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) {
    console.error(`[Geocode] No results for "${address}"`);
    return null;
  }
  return feature.center as [number, number]; // [lng, lat]
}

/** Get drive duration in minutes via Mapbox Directions API */
async function getDriveMinutes(
  destLng: number,
  destLat: number,
  mapboxToken: string
): Promise<number | null> {
  const coords = `${THRIFT_SHOP_LNG},${THRIFT_SHOP_LAT};${destLng},${destLat}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coords}?access_token=${mapboxToken}&overview=false`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[Directions] Failed: ${res.status}`);
    return null;
  }
  const data = await res.json();
  const durationSeconds = data.routes?.[0]?.duration;
  if (!durationSeconds) {
    console.error("[Directions] No route found");
    return null;
  }
  return Math.ceil(durationSeconds / 60); // seconds → minutes, round up
}

// ── Main handler ───────────────────────────────────────────────────────────

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const mapboxToken = Deno.env.get("MAPBOX_TOKEN");
    if (!mapboxToken) {
      return new Response(JSON.stringify({ error: "MAPBOX_TOKEN not set" }), { status: 500 });
    }

    // Fetch buffer setting
    const { data: bufferRow } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "eta_buffer_minutes")
      .single();
    const bufferMinutes = parseInt(bufferRow?.value ?? "5", 10);

    const now = nowPacific();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // Find orders that:
    // - are today or tomorrow (looking ahead up to 24h)
    // - not completed/cancelled
    // - not yet notified
    // - have a scheduled time
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

    const { data: orders, error } = await supabase
      .from("delivery_orders")
      .select("*")
      .in("scheduled_date", [todayStr, tomorrowStr])
      .not("scheduled_time", "is", null)
      .not("status", "in", '("completed","cancelled")')
      .eq("eta_notified", false);

    if (error) {
      console.error("[ETA] Query error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log(`[ETA] Checking ${orders?.length ?? 0} orders`);

    const results = [];

    for (const order of orders ?? []) {
      try {
        // Use override time if set
        const schedTime = order.scheduled_time_override ?? order.scheduled_time;
        const scheduledAt = toScheduledDate(order.scheduled_date, schedTime);

        // Address is origin for pickup, destination for delivery
        const address = order.order_type === "pickup"
          ? order.origin_address
          : order.destination_address;

        if (!address) {
          console.log(`[ETA] Order ${order.id} — no address, skipping`);
          continue;
        }

        // Geocode the customer address
        const coords = await geocodeAddress(address, mapboxToken);
        if (!coords) continue;

        const [destLng, destLat] = coords;

        // Get drive time
        const driveMinutes = await getDriveMinutes(destLng, destLat, mapboxToken);
        if (driveMinutes === null) continue;

        // notify_at = scheduled_time - drive_minutes - buffer
        const notifyAt = new Date(scheduledAt.getTime() - (driveMinutes + bufferMinutes) * 60 * 1000);

        console.log(
          `[ETA] Order ${order.id} (${order.customer_name}) — ` +
          `drive: ${driveMinutes}min, scheduled: ${scheduledAt.toLocaleTimeString()}, ` +
          `notify at: ${notifyAt.toLocaleTimeString()}`
        );

        // Save ETA data back to the order
        await supabase
          .from("delivery_orders")
          .update({
            eta_minutes:    driveMinutes,
            eta_checked_at: new Date().toISOString(),
            notify_at:      notifyAt.toISOString(),
          })
          .eq("id", order.id);

        // Check if it's time to fire the notification
        if (now >= notifyAt) {
          const isDelivery = order.order_type === "delivery";
          const title = isDelivery
            ? `🚨 Leave now — delivery for ${order.customer_name}`
            : `🚨 Leave now — pickup from ${order.customer_name}`;

          const content = [
            `Scheduled: ${new Date(scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
            `Drive time: ~${driveMinutes} min`,
            address,
          ].join(" · ");

          // Insert into your existing notifications table
          await supabase.from("notifications").insert({
            title,
            content,
            type:       "eta_alert",
            role_admin: true,
            role_user:  true,
            metadata: {
              order_id:      order.id,
              drive_minutes: driveMinutes,
              notify_at:     notifyAt.toISOString(),
              scheduled_at:  scheduledAt.toISOString(),
            },
            action_url: "/Delivery",
          });

          // Mark as notified
          await supabase
            .from("delivery_orders")
            .update({
              eta_notified:    true,
              eta_notified_at: new Date().toISOString(),
            })
            .eq("id", order.id);

          console.log(`[ETA] ✅ Fired notification for order ${order.id}`);
          results.push({ order_id: order.id, action: "notified", drive_minutes: driveMinutes });
        } else {
          const minutesUntilNotify = Math.round((notifyAt.getTime() - now.getTime()) / 60000);
          results.push({ order_id: order.id, action: "pending", notify_in_minutes: minutesUntilNotify, drive_minutes: driveMinutes });
        }

        // Small delay between API calls to be polite
        await new Promise((r) => setTimeout(r, 200));

      } catch (err) {
        console.error(`[ETA] Error processing order ${order.id}:`, err);
        results.push({ order_id: order.id, action: "error", error: String(err) });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[ETA] Fatal error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});