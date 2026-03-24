"use client";

import { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { Select } from "@/components/FormElements/select";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IntakeFormData, BLANK_FORM, TIME_SLOTS, PaymentStatus } from "@/types/delivery";
import { formatPhoneInput, convertTo24h } from "@/utils/deliveryUtils";

interface IntakeFormProps {
  supabase: SupabaseClient;
}

export default function IntakeForm({ supabase }: IntakeFormProps) {
  const [form, setForm] = useState<IntakeFormData>(BLANK_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const isDelivery = form.order_type === "delivery";
  const set = (k: keyof IntakeFormData, v: string) => setForm((p) => ({ ...p, [k]: v }));

  // ── Submit — CleanTrack pattern: snapshot, optimistic n/a here (form resets),
  //   error surfaced inline ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);

    if (!form.customer_name.trim())                     return setError("Customer name is required.");
    if (!form.item_description.trim())                  return setError("Item description is required.");
    if (isDelivery && !form.destination_address.trim()) return setError("Delivery address is required.");
    if (!isDelivery && !form.origin_address.trim())     return setError("Pickup address is required.");
    if (!form.taken_by.trim())                          return setError("Please enter who is taking this order.");

    setLoading(true);
    try {
      const { data: order, error: err } = await supabase
        .from("delivery_orders")
        .insert({
          order_type:          form.order_type,
          customer_name:       form.customer_name.trim(),
          customer_phone:      form.customer_phone.trim() || null,
          origin_address:      form.origin_address.trim() || null,
          destination_address: form.destination_address.trim() || null,
          item_description:    form.item_description.trim(),
          item_notes:          form.item_notes.trim() || null,
          scheduled_date:      form.scheduled_date || null,
          scheduled_time:      form.scheduled_time ? convertTo24h(form.scheduled_time) : null,
          payment_status:      form.payment_status,
          payment_notes:       form.payment_notes.trim() || null,
          taken_by:            form.taken_by.trim(),
          status:              "pending",
        })
        .select("id")
        .single();

      if (err) throw err;

      await supabase.from("notifications").insert({
        title:      isDelivery
          ? `📦 New Delivery — ${form.customer_name}`
          : `🚛 New Pickup — ${form.customer_name}`,
        content:    [
          isDelivery ? `To: ${form.destination_address}` : `From: ${form.origin_address}`,
          form.scheduled_date
            ? `${form.scheduled_date}${form.scheduled_time ? " @ " + form.scheduled_time : ""}`
            : "Date TBD",
          form.item_description,
        ].join(" · "),
        type:       "delivery_order",
        role_admin: true,
        role_user:  true,
        metadata:   { order_id: order.id, order_type: form.order_type },
        action_url: "/CMS/Delivery",
      });

      setSavedId(order.id);
      setForm(BLANK_FORM);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (savedId) {
    return (
      <ShowcaseSection title="Order Saved">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <span className="text-5xl">{isDelivery ? "📦" : "🚛"}</span>
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Order Saved!</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Driver board updated. Order …{savedId.slice(-6)}
          </p>
          <Button onClick={() => setSavedId(null)}>+ New Order</Button>
        </div>
      </ShowcaseSection>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Order type toggle */}
      <ShowcaseSection title="Order Type">
        <div className="flex gap-3">
          {(["delivery", "pickup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => set("order_type", t)}
              className="flex-1 py-2.5 rounded-[var(--radius)] text-sm font-bold transition-all border-2"
              style={{
                borderColor:  form.order_type === t ? "hsl(var(--sidebar-primary))" : "hsl(var(--border))",
                background:   form.order_type === t ? "hsl(var(--sidebar-primary))" : "transparent",
                color:        form.order_type === t ? "hsl(var(--sidebar-primary-foreground))" : "hsl(var(--muted-foreground))",
              }}
            >
              {t === "delivery" ? "📦 Delivery" : "🚛 Pickup"}
            </button>
          ))}
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3">
          {isDelivery
            ? "Item is priced & on hold in store. Scheduling delivery to customer's home."
            : "Donor is donating furniture. We go pick it up from their location."}
        </p>
      </ShowcaseSection>

      {/* Customer */}
      <ShowcaseSection title="Customer / Contact">
        <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
          <InputGroup
            label="Customer Name"
            type="text"
            placeholder="e.g. Nicole Larson"
            required
            value={form.customer_name}
            handleChange={(e) => set("customer_name", e.target.value)}
          />
          <InputGroup
            label="Phone Number"
            type="tel"
            placeholder="760-555-0123"
            value={form.customer_phone}
            handleChange={(e) => set("customer_phone", formatPhoneInput(e.target.value))}
          />
        </div>
      </ShowcaseSection>

      {/* Addresses */}
      <ShowcaseSection title="Addresses">
        {isDelivery ? (
          <div className="space-y-4.5">
            <InputGroup
              label="Delivery Address"
              type="text"
              placeholder="e.g. 708 W Dolphin Ave, Ridgecrest"
              required
              value={form.destination_address}
              handleChange={(e) => set("destination_address", e.target.value)}
            />
            <InputGroup
              label="Pickup From"
              type="text"
              placeholder="Store address (leave blank if from store)"
              value={form.origin_address}
              handleChange={(e) => set("origin_address", e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-4.5">
            <InputGroup
              label="Pickup Address"
              type="text"
              placeholder="e.g. 1601 N. Norma St, Ridgecrest"
              required
              value={form.origin_address}
              handleChange={(e) => set("origin_address", e.target.value)}
            />
            <InputGroup
              label="Drop Off To"
              type="text"
              placeholder="Store address (leave blank if back to store)"
              value={form.destination_address}
              handleChange={(e) => set("destination_address", e.target.value)}
            />
          </div>
        )}
      </ShowcaseSection>

      {/* Item */}
      <ShowcaseSection title="Item Details">
        <div className="space-y-4.5">
          <InputGroup
            label="Item Description"
            type="text"
            placeholder="e.g. Brown leather couch, glass dining table"
            required
            value={form.item_description}
            handleChange={(e) => set("item_description", e.target.value)}
          />
          <TextAreaGroup
            label="Special Notes"
            placeholder="e.g. Back house, 3rd floor, red hold tag on item"
            defaultValue={form.item_notes}
          />
        </div>
      </ShowcaseSection>

      {/* Schedule */}
      <ShowcaseSection title="Schedule">
        <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
          <InputGroup
            label="Date"
            type="date"
            placeholder=""
            value={form.scheduled_date}
            handleChange={(e) => set("scheduled_date", e.target.value)}
          />
          <Select
            label="Time"
            placeholder="-- Select time --"
            defaultValue={form.scheduled_time}
            items={TIME_SLOTS.map((t) => ({ label: t, value: t }))}
            className=""
          />
        </div>
      </ShowcaseSection>

      {/* Payment — delivery only */}
      {isDelivery && (
        <ShowcaseSection title="Payment">
          <div className="space-y-4.5">
            <div>
              <p className="text-body-sm font-medium text-[hsl(var(--foreground))] mb-3">
                Payment Status
              </p>
              <div className="flex gap-2 flex-wrap">
                {(["paid", "partial", "unpaid"] as PaymentStatus[]).map((s) => {
                  const active = form.payment_status === s;
                  const variant = active
                    ? s === "paid" ? "default"
                      : s === "partial" ? "secondary"
                      : "destructive"
                    : "outline";
                  return (
                    <button key={s} onClick={() => set("payment_status", s)}>
                      <Badge variant={variant as "default" | "secondary" | "destructive" | "outline"}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
            <InputGroup
              label="Payment Notes"
              type="text"
              placeholder="e.g. table paid, delivery not paid"
              value={form.payment_notes}
              handleChange={(e) => set("payment_notes", e.target.value)}
            />
          </div>
        </ShowcaseSection>
      )}

      {/* Staff */}
      <ShowcaseSection title="Staff">
        <InputGroup
          label="Taken By"
          type="text"
          placeholder="e.g. Rachel"
          required
          value={form.taken_by}
          handleChange={(e) => set("taken_by", e.target.value)}
        />
      </ShowcaseSection>

      {/* Error */}
      {error && (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10 px-4 py-3 text-sm font-medium text-[hsl(var(--destructive))]">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Saving…" : `Save ${isDelivery ? "Delivery" : "Pickup"} Order`}
      </Button>

    </div>
  );
}