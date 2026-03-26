"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Check, ChevronLeft, ChevronRight, Truck, Package, AlertCircle } from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn }       from "@/lib/utils";
import { BLANK_FORM, TIME_SLOTS } from "@/types/delivery";
import { formatPhoneInput, convertTo24h, formatDeliveryDate } from "@/utils/deliveryUtils";

import { STEPS, DRAFT_KEY }   from "@/components/delivery/_components/types";
import { buildSlots, getUpcomingDates } from "@/components/delivery/_components/utils";
import { StepShell }          from "@/components/delivery/_components/StepShell";
import { OptionCard }         from "@/components/delivery/_components/OptionCard";
import { Field }              from "@/components/delivery/_components/Field";
import { SummaryRow }         from "@/components/delivery/_components/SummaryRow";
import { DateStrip, SlotGrid, ExistingOrdersPanel } from "@/components/delivery/_components/TimeSlotGrid";
import { AddressAutocomplete } from "@/components/delivery/_components/AddressAutocomplete";

import type { IntakeFormProps, ScheduleBlock, ExistingOrder } from "@/components/delivery/_components/types";
import type { IntakeFormData } from "@/types/delivery";

// ── Draft persistence ─────────────────────────────────────────────────────────

// Bump this whenever the form shape changes — forces stale drafts to clear
const DRAFT_VERSION = 2;

interface DraftState {
  form:    IntakeFormData;
  takenBy: string;
  step:    number;
  v?:      number;
}

function loadDraft(): DraftState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftState;
    // Clear draft if it's from an older version
    if (!parsed.v || parsed.v < DRAFT_VERSION) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveDraft(state: DraftState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...state, v: DRAFT_VERSION }));
  } catch { /* quota exceeded — fail silently */ }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function IntakeForm({ supabase }: IntakeFormProps) {
  // Restore from draft on first mount
  const draft = loadDraft();

  const [step, setStep]       = useState(draft?.step ?? 1);
  const [form, setForm]       = useState<IntakeFormData>(draft?.form ?? BLANK_FORM);
  const [takenBy, setTakenBy] = useState(draft?.takenBy ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [blocks, setBlocks]             = useState<ScheduleBlock[]>([]);
  const [dayOrders, setDayOrders]       = useState<ExistingOrder[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Per-date cache so tapping the same date twice is instant
  const dateCache = useRef<Record<string, ExistingOrder[]>>({});
  // Track in-flight fetches so we don't double-fire
  const fetchingDate = useRef<string | null>(null);

  const [animDir, setAnimDir] = useState<"fwd" | "bck">("fwd");
  const [animKey, setAnimKey] = useState(0);

  const isDelivery = form.order_type === "delivery";

  const set = useCallback((k: keyof IntakeFormData, v: string) =>
    setForm((p) => ({ ...p, [k]: v })), []);

  // Persist draft whenever form/step/takenBy changes
  useEffect(() => {
    saveDraft({ form, takenBy, step });
  }, [form, takenBy, step]);

  // Fetch schedule blocks + orders for a date in parallel
  // Blocks are only fetched once (cached in state); orders are cached per-date
  const fetchSlotsForDate = useCallback(async (date: string) => {
    if (!date) { setDayOrders([]); return; }

    // Instant hit if we've already fetched this date
    if (dateCache.current[date]) {
      setDayOrders(dateCache.current[date]);
      setLoadingSlots(false);
      return;
    }

    // Prevent duplicate in-flight fetches for the same date
    if (fetchingDate.current === date) return;
    fetchingDate.current = date;
    setLoadingSlots(true);

    // Fire blocks + orders in parallel — blocks only needed if not yet loaded
    const blocksNeeded = blocks.length === 0;
    const [blocksRes, ordersRes] = await Promise.all([
      blocksNeeded
        ? supabase
            .from("delivery_schedule_blocks")
            .select("start_time, end_time, label, is_active")
            .eq("is_active", true)
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("delivery_orders")
        .select("id, customer_name, order_type, scheduled_time, scheduled_time_override, item_description, status")
        .eq("scheduled_date", date)
        .neq("status", "cancelled")
        .neq("status", "completed")
        .not("scheduled_time", "is", null),
    ]);

    if (blocksNeeded && blocksRes.data) setBlocks(blocksRes.data as ScheduleBlock[]);
    const orders = (ordersRes.data ?? []) as ExistingOrder[];
    dateCache.current[date] = orders;

    // Only apply if this date is still the selected one
    if (fetchingDate.current === date) {
      setDayOrders(orders);
      setLoadingSlots(false);
      fetchingDate.current = null;
    }
  }, [supabase, blocks.length]);

  // Trigger fetch when date changes
  useEffect(() => {
    fetchSlotsForDate(form.scheduled_date);
  }, [form.scheduled_date, fetchSlotsForDate]);

  // Prefetch the next 3 dates when the user reaches Step 3
  useEffect(() => {
    if (step !== 3) return;
    const upcoming = getUpcomingDates(4).slice(1); // skip today, prefetch next 3
    upcoming.forEach((d) => {
      if (!dateCache.current[d.value]) {
        supabase
          .from("delivery_orders")
          .select("id, customer_name, order_type, scheduled_time, scheduled_time_override, item_description, status")
          .eq("scheduled_date", d.value)
          .neq("status", "cancelled")
          .neq("status", "completed")
          .not("scheduled_time", "is", null)
          .then(({ data }) => {
            if (data) dateCache.current[d.value] = data as ExistingOrder[];
          });
      }
    });
  }, [step, supabase]);

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
    // Step 1: Who
    if (step === 1 && !form.customer_name.trim())
      return "Please enter the customer's name.";
    // Step 2: Where + What
    if (step === 2 && isDelivery && !form.destination_address.trim())
      return "Please enter the delivery address.";
    if (step === 2 && !isDelivery && !form.origin_address.trim())
      return "Please enter the pickup address.";
    if (step === 2 && !form.item_description.trim())
      return "Please describe the item(s).";
    // Step 4: Confirm
    if (step === 4 && !takenBy.trim())
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
            ? `${formatDeliveryDate(form.scheduled_date)}${form.scheduled_time ? " @ " + form.scheduled_time : ""}`
            : "Date TBD",
          form.item_description,
        ].join(" · "),
        type:       "delivery_order",
        role_admin: true,
        role_user:  true,
        metadata:   { order_id: order.id, order_type: form.order_type },
        action_url: "/Delivery",
      });

      // Only clear draft after confirmed success
      clearDraft();
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
          onClick={() => {
            setSavedId(null);
            setForm(BLANK_FORM);
            setTakenBy("");
            setDayOrders([]);
            setStep(1);
          }}
        >
          + Schedule Another
        </Button>
      </div>
    );
  }

  // ── Progress ─────────────────────────────────────────────────────────────────

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="max-w-lg mx-auto">
      <style>{`
        @keyframes slideInFwd { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInBck { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* Progress — 4 wide dots so they're easy to see */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  s.id < step   ? "bg-green-500 text-white" :
                  s.id === step ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] scale-110 shadow-sm" :
                                  "bg-muted text-muted-foreground",
                )}>
                  {s.id < step ? <Check size={13} /> : s.id}
                </div>
                <span className={cn(
                  "text-[11px] font-semibold whitespace-nowrap",
                  s.id === step ? "text-[hsl(var(--sidebar-primary))]" : "text-muted-foreground",
                )}>
                  {s.label}
                </span>
              </div>
              {/* Connector line between dots */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 rounded-full mt-[-14px]"
                  style={{ background: s.id < step ? "hsl(var(--sidebar-primary))" : "hsl(var(--muted))" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Animated step */}
      <div
        key={animKey}
        className="min-h-[380px]"
        style={{ animation: `${animDir === "fwd" ? "slideInFwd" : "slideInBck"} 0.2s ease-out` }}
      >

        {/* ── Step 1: Who + Type ─────────────────────────────────────────── */}
        {step === 1 && (
          <StepShell title="What are we scheduling?" sub="Choose the type, then enter customer details">
            {/* Type toggle — compact, side by side */}
            <div className="flex gap-3 mb-6">
              <OptionCard
                selected={form.order_type === "pickup"}
                onClick={() => set("order_type", "pickup")}
                icon={<Truck size={22} />}
                label="Pickup"
                desc="Go get a donation"
              />
              <OptionCard
                selected={form.order_type === "delivery"}
                onClick={() => set("order_type", "delivery")}
                icon={<Package size={22} />}
                label="Delivery"
                desc="Deliver to customer"
              />
            </div>

            <div className="space-y-4">
              <Field label="Customer / Donor Name" required>
                <Input
                  placeholder={isDelivery ? "e.g. Nicole Larson" : "e.g. James Torres"}
                  value={form.customer_name}
                  onChange={(e) => set("customer_name", e.target.value)}
                  className="h-14 text-base rounded-2xl"
                  autoFocus
                />
              </Field>
              <Field label="Phone Number (optional)">
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

        {/* ── Step 2: Where + What ───────────────────────────────────────── */}
        {step === 2 && (
          <StepShell
            title={isDelivery ? "Where & what?" : "Pickup from where?"}
            sub="Address and item description"
          >
            <div className="space-y-4">
              {isDelivery ? (
                <Field label="Delivery Address" required>
                  <AddressAutocomplete
                    placeholder="123 Main St, Ridgecrest"
                    value={form.destination_address}
                    onChange={(v) => set("destination_address", v)}
                    autoFocus
                  />
                </Field>
              ) : (
                <Field label="Pickup Address" required>
                  <AddressAutocomplete
                    placeholder="456 Oak Ave, Ridgecrest"
                    value={form.origin_address}
                    onChange={(v) => set("origin_address", v)}
                    autoFocus
                  />
                </Field>
              )}

              <Field label="Item Description" required>
                <Input
                  placeholder={isDelivery ? "e.g. Brown couch, 2 end tables" : "e.g. Dresser, recliner chair"}
                  value={form.item_description}
                  onChange={(e) => set("item_description", e.target.value)}
                  className="h-14 text-base rounded-2xl"
                />
              </Field>

              <Field label="Notes (optional)">
                <Textarea
                  placeholder="e.g. Very heavy, needs two people"
                  value={form.item_notes}
                  onChange={(e) => set("item_notes", e.target.value)}
                  className="text-base rounded-2xl resize-none"
                  rows={2}
                />
              </Field>
            </div>
          </StepShell>
        )}

        {/* ── Step 3: When ───────────────────────────────────────────────── */}
        {step === 3 && (
          <StepShell title="When should we go?" sub="Pick a date and time slot">
            <div className="space-y-5">
              <DateStrip
                dates={dates}
                selectedDate={form.scheduled_date}
                onSelectDate={(v) => {
                  set("scheduled_date", v);
                  set("scheduled_time", "");
                }}
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
                <p className="text-sm text-muted-foreground">
                  Select a date above to see available time slots.
                </p>
              )}
            </div>
          </StepShell>
        )}

        {/* ── Step 4: Confirm ────────────────────────────────────────────── */}
        {step === 4 && (
          <StepShell title="Almost done!" sub="Review the order and confirm">
            {/* Summary card */}
            <div className="rounded-2xl border border-border bg-muted/30 p-4 mb-5 space-y-2.5">
              <SummaryRow label="Type"    value={isDelivery ? "📦 Delivery" : "🚛 Pickup"} />
              <SummaryRow label="Name"    value={form.customer_name} />
              {form.customer_phone && <SummaryRow label="Phone"   value={form.customer_phone} />}
              <SummaryRow
                label="Address"
                value={(isDelivery ? form.destination_address : form.origin_address) || "—"}
              />
              <SummaryRow label="Items"   value={form.item_description} />
              {form.item_notes && <SummaryRow label="Notes" value={form.item_notes} />}
              <SummaryRow
                label="When"
                value={form.scheduled_date
                  ? `${formatDeliveryDate(form.scheduled_date)}${form.scheduled_time ? " @ " + form.scheduled_time : " — time TBD"}`
                  : "Date TBD"}
              />
            </div>

            {/* Payment section commented out — DART Thrift does not take payments */}
            {/* {isDelivery && (
              <div className="mb-5">
                <Field label="Payment Status">
                  ...payment buttons...
                </Field>
              </div>
            )} */}

            {/* Taken by */}
            <Field label="Your name — who is taking this?" required>
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

      {/* Nav */}
      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => goTo(step - 1, "bck")}
            className="rounded-2xl gap-1.5"
          >
            <ChevronLeft size={18} />
            Back
          </Button>
        )}

        {step < 4 ? (
          <Button
            size="lg"
            onClick={handleNext}
            className="flex-1 rounded-2xl gap-1.5"
          >
            Continue
            <ChevronRight size={18} />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-2xl gap-1.5"
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

      {/* Draft notice — only if resuming */}
      {draft && step > 1 && (
        <p className="text-center text-xs text-muted-foreground mt-4">
          Draft restored —{" "}
          <button
            className="underline underline-offset-2"
            onClick={() => { clearDraft(); setForm(BLANK_FORM); setTakenBy(""); setStep(1); }}
          >
            start over
          </button>
        </p>
      )}
    </div>
  );
}