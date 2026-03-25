"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, ChevronLeft, ChevronRight, Truck, Package, AlertCircle } from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn }       from "@/lib/utils";
import { BLANK_FORM, TIME_SLOTS } from "@/types/delivery";
import { formatPhoneInput, convertTo24h } from "@/utils/deliveryUtils";

import { STEPS }              from "@/components/delivery/_components/types";
import { buildSlots, getUpcomingDates } from "@/components/delivery/_components/utils";
import { StepShell }          from "@/components/delivery/_components/StepShell";
import { OptionCard }         from "@/components/delivery/_components/OptionCard";
import { Field }              from "@/components/delivery/_components/Field";
import { SummaryRow }         from "@/components/delivery/_components/SummaryRow";
import { DateStrip, SlotGrid, ExistingOrdersPanel } from "@/components/delivery/_components/TimeSlotGrid";

import type { IntakeFormProps, ScheduleBlock, ExistingOrder } from "@/components/delivery/_components/types";
import type { IntakeFormData } from "@/types/delivery";

export default function IntakeForm({ supabase }: IntakeFormProps) {
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState<IntakeFormData>(BLANK_FORM);
  const [takenBy, setTakenBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [blocks, setBlocks]           = useState<ScheduleBlock[]>([]);
  const [dayOrders, setDayOrders]     = useState<ExistingOrder[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [animDir, setAnimDir] = useState<"fwd" | "bck">("fwd");
  const [animKey, setAnimKey] = useState(0);

  const isDelivery = form.order_type === "delivery";
  const set = useCallback(
    (k: keyof IntakeFormData, v: string) => setForm((p) => ({ ...p, [k]: v })),
    [],
  );

  // Load break/lunch blocks once
  useEffect(() => {
    supabase
      .from("delivery_schedule_blocks")
      .select("start_time, end_time, label, is_active")
      .then(({ data }) => { if (data) setBlocks(data as ScheduleBlock[]); });
  }, [supabase]);

  // Reload existing orders whenever selected date changes
  useEffect(() => {
    if (!form.scheduled_date) { setDayOrders([]); return; }
    setLoadingSlots(true);
    supabase
      .from("delivery_orders")
      .select("id, customer_name, order_type, scheduled_time, item_description, status")
      .eq("scheduled_date", form.scheduled_date)
      .not("status", "in", '("cancelled","completed")')
      .not("scheduled_time", "is", null)
      .then(({ data }) => {
        setDayOrders((data ?? []) as ExistingOrder[]);
        setLoadingSlots(false);
      });
  }, [form.scheduled_date, supabase]);

  const dates = getUpcomingDates(21);
  const slots = buildSlots(TIME_SLOTS, blocks, dayOrders);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const goTo = (n: number, dir: "fwd" | "bck") => {
    setError(null);
    setAnimDir(dir);
    setAnimKey((k) => k + 1);
    setStep(n);
  };

  const validate = (): string | null => {
    if (step === 2 && !form.customer_name.trim())
      return "Please enter the customer's name.";
    if (step === 3 && isDelivery && !form.destination_address.trim())
      return "Please enter the delivery address.";
    if (step === 3 && !isDelivery && !form.origin_address.trim())
      return "Please enter the pickup address.";
    if (step === 4 && !form.item_description.trim())
      return "Please describe the item(s).";
    if (step === 7 && !takenBy.trim())
      return "Please enter who is taking this order.";
    return null;
  };

  const handleNext = () => {
    const err = validate();
    if (err) { setError(err); return; }
    goTo(step + 1, "fwd");
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: order, error: dbErr } = await supabase
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
          taken_by:            takenBy.trim(),
          status:              "pending",
        })
        .select("id")
        .single();

      if (dbErr) throw dbErr;

      await supabase.from("notifications").insert({
        title:   isDelivery
          ? `📦 New Delivery — ${form.customer_name}`
          : `🚛 New Pickup — ${form.customer_name}`,
        content: [
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
        action_url: "/Delivery",
      });

      setSavedId(order.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success ─────────────────────────────────────────────────────────────────

  if (savedId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Check size={40} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isDelivery ? "Delivery Scheduled!" : "Pickup Scheduled!"}
          </h2>
          <p className="text-muted-foreground">Driver board updated.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Order #{savedId.slice(-6).toUpperCase()}
          </p>
        </div>
        <Button
          size="lg"
          className="rounded-2xl px-8"
          onClick={() => { setSavedId(null); setForm(BLANK_FORM); setTakenBy(""); setStep(1); }}
        >
          + Schedule Another
        </Button>
      </div>
    );
  }

  // ── Progress bar ─────────────────────────────────────────────────────────────

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="max-w-lg mx-auto">
      <style>{`
        @keyframes slideInFwd { from{opacity:0;transform:translateX(18px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInBck { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2 px-1">
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1 flex-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 mx-auto",
                s.id < step   ? "bg-green-500 text-white" :
                s.id === step ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] scale-110 shadow-md" :
                                "bg-muted text-muted-foreground",
              )}>
                {s.id < step ? <Check size={12} /> : s.id}
              </div>
              <span className={cn(
                "text-[10px] hidden sm:block font-medium",
                s.id === step ? "text-[hsl(var(--sidebar-primary))]" : "text-muted-foreground",
              )}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden mx-1">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out bg-[hsl(var(--sidebar-primary))]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Animated step content */}
      <div
        key={animKey}
        className="min-h-[360px]"
        style={{ animation: `${animDir === "fwd" ? "slideInFwd" : "slideInBck"} 0.22s ease-out` }}
      >
        {/* Step 1 — Type */}
        {step === 1 && (
          <StepShell title="What are we doing?" sub="Choose the type of order">
            <div className="flex flex-col gap-4">
              <OptionCard
                selected={form.order_type === "pickup"}
                onClick={() => set("order_type", "pickup")}
                icon={<Truck size={26} />}
                label="Pickup"
                desc="We go pick up a donation from a donor"
              />
              <OptionCard
                selected={form.order_type === "delivery"}
                onClick={() => set("order_type", "delivery")}
                icon={<Package size={26} />}
                label="Delivery"
                desc="We deliver an item to a customer's home"
              />
            </div>
          </StepShell>
        )}

        {/* Step 2 — Contact */}
        {step === 2 && (
          <StepShell
            title={isDelivery ? "Who is the customer?" : "Who is the donor?"}
            sub="Enter their name and phone number"
          >
            <div className="space-y-5">
              <Field label="Full Name" required>
                <Input
                  placeholder={isDelivery ? "e.g. Nicole Larson" : "e.g. James Torres"}
                  value={form.customer_name}
                  onChange={(e) => set("customer_name", e.target.value)}
                  className="h-14 text-base rounded-2xl"
                  autoFocus
                />
              </Field>
              <Field label="Phone Number">
                <Input
                  type="tel"
                  inputMode="tel"
                  placeholder="760-555-0123"
                  value={form.customer_phone}
                  onChange={(e) => set("customer_phone", formatPhoneInput(e.target.value))}
                  className="h-14 text-base rounded-2xl"
                />
              </Field>
            </div>
          </StepShell>
        )}

        {/* Step 3 — Address */}
        {step === 3 && (
          <StepShell
            title={isDelivery ? "Where are we delivering?" : "Where are we picking up?"}
            sub="Full street address in Ridgecrest"
          >
            <div className="space-y-5">
              {isDelivery ? (
                <>
                  <Field label="Delivery Address" required>
                    <Input
                      placeholder="123 Main St, Ridgecrest"
                      value={form.destination_address}
                      onChange={(e) => set("destination_address", e.target.value)}
                      className="h-14 text-base rounded-2xl"
                      autoFocus
                    />
                  </Field>
                  <Field label="Pickup From (blank = from store)">
                    <Input
                      placeholder="232 Sahara Dr"
                      value={form.origin_address}
                      onChange={(e) => set("origin_address", e.target.value)}
                      className="h-14 text-base rounded-2xl"
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Pickup Address" required>
                    <Input
                      placeholder="456 Oak Ave, Ridgecrest"
                      value={form.origin_address}
                      onChange={(e) => set("origin_address", e.target.value)}
                      className="h-14 text-base rounded-2xl"
                      autoFocus
                    />
                  </Field>
                  <Field label="Drop Off To (blank = to store)">
                    <Input
                      placeholder="232 Sahara Dr"
                      value={form.destination_address}
                      onChange={(e) => set("destination_address", e.target.value)}
                      className="h-14 text-base rounded-2xl"
                    />
                  </Field>
                </>
              )}
            </div>
          </StepShell>
        )}

        {/* Step 4 — Items */}
        {step === 4 && (
          <StepShell title="What are the items?" sub="Describe what we're moving">
            <div className="space-y-5">
              <Field label="Item Description" required>
                <Input
                  placeholder={isDelivery ? "e.g. Brown couch, 2 end tables" : "e.g. Dresser, recliner chair"}
                  value={form.item_description}
                  onChange={(e) => set("item_description", e.target.value)}
                  className="h-14 text-base rounded-2xl"
                  autoFocus
                />
              </Field>
              <Field label="Notes (optional)">
                <Textarea
                  placeholder="e.g. Very heavy, needs two people"
                  value={form.item_notes}
                  onChange={(e) => set("item_notes", e.target.value)}
                  className="text-base rounded-2xl resize-none min-h-[90px]"
                />
              </Field>
            </div>
          </StepShell>
        )}

        {/* Step 5 — When */}
        {step === 5 && (
          <StepShell title="When should we go?" sub="Pick a date — then choose an open time slot">
            <div className="space-y-5">
              <DateStrip
                dates={dates}
                selectedDate={form.scheduled_date}
                onSelectDate={(v) => { set("scheduled_date", v); set("scheduled_time", ""); }}
              />

              {form.scheduled_date && (
                <>
                  <SlotGrid
                    slots={slots}
                    selectedTime={form.scheduled_time}
                    loading={loadingSlots}
                    onSelect={(label) => set("scheduled_time", label)}
                    selectedDate={form.scheduled_date}
                  />
                  <ExistingOrdersPanel orders={dayOrders} />
                </>
              )}

              {!form.scheduled_date && (
                <button
                  onClick={() => goTo(6, "fwd")}
                  className="text-sm text-muted-foreground underline underline-offset-2"
                >
                  Skip — schedule later
                </button>
              )}
            </div>
          </StepShell>
        )}

        {/* Step 6 — Payment */}
        {step === 6 && (
          <StepShell
            title={isDelivery ? "Payment status?" : "No payment needed"}
            sub={isDelivery ? "How was this handled?" : "Pickups are free — just continue"}
          >
            {isDelivery ? (
              <div className="space-y-3">
                {([
                  { value: "paid",    label: "Paid in Full",    emoji: "✅", desc: "Customer already paid"    },
                  { value: "partial", label: "Partial Payment", emoji: "🔶", desc: "Deposit or partial paid"   },
                  { value: "unpaid",  label: "Pay on Delivery", emoji: "💵", desc: "Collect when we arrive"    },
                  { value: "n/a",     label: "N/A",             emoji: "—",  desc: "Not applicable"            },
                ] as const).map((opt) => {
                  const active = form.payment_status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => set("payment_status", opt.value)}
                      className={cn(
                        "flex items-center gap-4 w-full px-5 py-4 rounded-2xl border-2 text-left transition-all active:scale-95",
                        active
                          ? "border-[hsl(var(--sidebar-primary))] bg-[hsl(var(--sidebar-primary)/0.08)]"
                          : "border-border bg-background hover:border-[hsl(var(--sidebar-primary))]",
                      )}
                    >
                      <span className="text-2xl w-8 text-center">{opt.emoji}</span>
                      <div className="flex-1">
                        <p className={cn("font-bold text-sm", active ? "text-[hsl(var(--sidebar-primary))]" : "text-foreground")}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                      {active && <Check size={18} className="text-[hsl(var(--sidebar-primary))] shrink-0" />}
                    </button>
                  );
                })}
                {(form.payment_status === "partial" || form.payment_status === "unpaid") && (
                  <Field label="Payment Notes">
                    <Input
                      placeholder="e.g. $50 deposit paid, balance $120 due on delivery"
                      value={form.payment_notes}
                      onChange={(e) => set("payment_notes", e.target.value)}
                      className="h-14 text-base rounded-2xl"
                    />
                  </Field>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <span className="text-5xl">🎁</span>
                <p className="text-muted-foreground">
                  This is a donation pickup — no charge to the donor.
                </p>
              </div>
            )}
          </StepShell>
        )}

        {/* Step 7 — Confirm */}
        {step === 7 && (
          <StepShell title="Almost done!" sub="Review and confirm the order">
            <div className="rounded-2xl border border-border bg-muted/30 p-5 mb-5 space-y-3">
              <SummaryRow label="Type"    value={isDelivery ? "📦 Delivery" : "🚛 Pickup"} />
              <SummaryRow label="Name"    value={form.customer_name} />
              {form.customer_phone && <SummaryRow label="Phone"   value={form.customer_phone} />}
              <SummaryRow label="Address" value={(isDelivery ? form.destination_address : form.origin_address) || "—"} />
              <SummaryRow label="Items"   value={form.item_description} />
              {form.item_notes && <SummaryRow label="Notes"   value={form.item_notes} />}
              <SummaryRow
                label="When"
                value={form.scheduled_date
                  ? `${form.scheduled_date}${form.scheduled_time ? " @ " + form.scheduled_time : ""}`
                  : "Date TBD"}
              />
              {isDelivery && <SummaryRow label="Payment" value={form.payment_status} />}
            </div>
            <Field label="Your name — who is taking this order?" required>
              <Input
                placeholder="e.g. Kaitlyn"
                value={takenBy}
                onChange={(e) => setTakenBy(e.target.value)}
                className="h-14 text-base rounded-2xl"
                autoFocus
              />
            </Field>
          </StepShell>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => goTo(step - 1, "bck")}
            className="rounded-2xl gap-2"
          >
            <ChevronLeft size={18} />
            Back
          </Button>
        )}

        {step < 7 ? (
          <Button
            size="lg"
            onClick={handleNext}
            className="flex-1 rounded-2xl gap-2"
          >
            Continue
            <ChevronRight size={18} />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-2xl gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check size={18} />
                Confirm Order
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}