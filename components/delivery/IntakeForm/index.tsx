"use client";

import { useState, useEffect, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { ChevronLeft, ChevronRight, Check, Truck, Package, Clock, AlertCircle } from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label }    from "@/components/ui/label";
import { cn }       from "@/lib/utils";
import { IntakeFormData, BLANK_FORM, TIME_SLOTS } from "@/types/delivery";
import { formatPhoneInput, convertTo24h } from "@/utils/deliveryUtils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface IntakeFormProps {
  supabase: SupabaseClient;
  isDark?: boolean;
}

interface ScheduleBlock {
  start_time: string;
  end_time:   string;
  label:      string;
  is_active:  boolean;
}

interface ExistingOrder {
  id:           string;
  customer_name: string;
  order_type:   string;
  scheduled_time: string;
  item_description: string;
  status:       string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** "9:30 AM" → minutes since midnight */
function labelToMinutes(label: string): number {
  const [time, mod] = label.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (mod === "PM" && h !== 12) h += 12;
  if (mod === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

/** "09:30:00" → minutes since midnight */
function pgTimeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** minutes → "9:30 AM" */
function minutesToLabel(mins: number): string {
  const h24 = Math.floor(mins / 60);
  const m   = mins % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12  = h24 % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

interface SlotMeta {
  label:        string;
  blocked:      boolean;
  blockLabel?:  string;
  orders:       ExistingOrder[];
  available:    boolean; // false = blocked OR has orders
}

function buildSlots(
  slots: string[],
  blocks: ScheduleBlock[],
  orders: ExistingOrder[]
): SlotMeta[] {
  return slots.map((label) => {
    const slotMins = labelToMinutes(label);

    // Check break/lunch overlap
    const matchBlock = blocks.find((b) => {
      if (!b.is_active) return false;
      const start = pgTimeToMinutes(b.start_time);
      const end   = pgTimeToMinutes(b.end_time);
      return slotMins >= start && slotMins < end;
    });

    // Find orders booked at this exact slot (or within 30 mins after)
    const slotOrders = orders.filter((o) => {
      const orderMins = pgTimeToMinutes(o.scheduled_time);
      // Consider a slot "taken" if an order starts within 0–29 min of it
      return orderMins >= slotMins && orderMins < slotMins + 30;
    });

    return {
      label,
      blocked:    !!matchBlock,
      blockLabel: matchBlock?.label,
      orders:     slotOrders,
      available:  !matchBlock && slotOrders.length === 0,
    };
  });
}

function getUpcomingDates(days = 14) {
  const result = [];
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    result.push({
      value:      `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,
      dayName:    d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum:     d.getDate(),
      monthShort: d.toLocaleDateString("en-US", { month: "short" }),
      isToday:    i === 0,
      isWeekend:  d.getDay() === 0 || d.getDay() === 6,
    });
  }
  return result;
}

// ── Step definitions ──────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Type"    },
  { id: 2, label: "Contact" },
  { id: 3, label: "Address" },
  { id: 4, label: "Items"   },
  { id: 5, label: "When"    },
  { id: 6, label: "Payment" },
  { id: 7, label: "Confirm" },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function IntakeForm({ supabase, isDark = false }: IntakeFormProps) {
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState<IntakeFormData>(BLANK_FORM);
  const [takenBy, setTakenBy]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [savedId, setSavedId]   = useState<string | null>(null);

  // Schedule data
  const [blocks, setBlocks]         = useState<ScheduleBlock[]>([]);
  const [dayOrders, setDayOrders]   = useState<ExistingOrder[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Animation
  const [animDir, setAnimDir]   = useState<"fwd"|"bck">("fwd");
  const [animKey, setAnimKey]   = useState(0);

  const isDelivery = form.order_type === "delivery";
  const set = useCallback((k: keyof IntakeFormData, v: string) =>
    setForm((p) => ({ ...p, [k]: v })), []);

  // Load break blocks once
  useEffect(() => {
    supabase
      .from("delivery_schedule_blocks")
      .select("start_time, end_time, label, is_active")
      .then(({ data }) => { if (data) setBlocks(data as ScheduleBlock[]); });
  }, [supabase]);

  // Load existing orders whenever selected date changes
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

  const goTo = (n: number, dir: "fwd"|"bck") => {
    setError(null);
    setAnimDir(dir);
    setAnimKey(k => k + 1);
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
    if (step < 7) goTo(step + 1, "fwd");
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
        title:      isDelivery
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

  // ── Success screen ──────────────────────────────────────────────────────────

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
          onClick={() => {
            setSavedId(null);
            setForm(BLANK_FORM);
            setTakenBy("");
            setDayOrders([]);
            setStep(1);
          }}
          className="rounded-2xl px-8"
        >
          + Schedule Another
        </Button>
      </div>
    );
  }

  // ── Progress bar ────────────────────────────────────────────────────────────

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="max-w-lg mx-auto">
      <style>{`
        @keyframes slideInFwd { from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)} }
        @keyframes slideInBck { from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* ── Progress ── */}
      <div className="mb-8">
        {/* Labels row */}
        <div className="flex items-center justify-between mb-2 px-1">
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1 flex-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 mx-auto",
                s.id < step  ? "bg-green-500 text-white" :
                s.id === step ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] scale-110 shadow-md" :
                                "bg-muted text-muted-foreground"
              )}>
                {s.id < step ? <Check size={12} /> : s.id}
              </div>
              <span className={cn(
                "text-[10px] hidden sm:block font-medium leading-tight text-center",
                s.id === step ? "text-[hsl(var(--sidebar-primary))]" : "text-muted-foreground"
              )}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        {/* Bar */}
        <div className="h-1 rounded-full bg-muted overflow-hidden mx-1">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out bg-[hsl(var(--sidebar-primary))]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Animated step ── */}
      <div
        key={animKey}
        className="min-h-[360px]"
        style={{ animation: `${animDir === "fwd" ? "slideInFwd" : "slideInBck"} 0.22s ease-out` }}
      >

        {/* ── Step 1: Type ── */}
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

        {/* ── Step 2: Contact ── */}
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

        {/* ── Step 3: Address ── */}
        {step === 3 && (
          <StepShell
            title={isDelivery ? "Where are we delivering?" : "Where are we picking up?"}
            sub="Enter the full street address in Ridgecrest"
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

        {/* ── Step 4: Items ── */}
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

        {/* ── Step 5: When — visual time picker ── */}
        {step === 5 && (
          <StepShell
            title="When should we go?"
            sub="Pick a date — then choose an open time slot"
          >
            {/* Date strip */}
            <div className="mb-5">
              <Label className="text-sm font-semibold mb-2 block">Date</Label>
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: "none" }}>
                {dates.map((d) => {
                  const active = form.scheduled_date === d.value;
                  return (
                    <button
                      key={d.value}
                      onClick={() => {
                        set("scheduled_date", active ? "" : d.value);
                        set("scheduled_time", "");
                      }}
                      className={cn(
                        "flex-shrink-0 snap-start flex flex-col items-center gap-0.5 w-14 py-2.5 rounded-2xl border-2 transition-all active:scale-95",
                        d.isWeekend && !active ? "opacity-50" : "",
                        active
                          ? "border-[hsl(var(--sidebar-primary))] bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"
                          : "border-border bg-background text-foreground hover:border-[hsl(var(--sidebar-primary))]"
                      )}
                    >
                      <span className="text-[10px] font-semibold uppercase">{d.dayName}</span>
                      <span className="text-lg font-bold leading-tight">{d.dayNum}</span>
                      <span className="text-[10px]">{d.monthShort}</span>
                      {d.isToday && (
                        <span className={cn("text-[9px] font-bold", active ? "text-white/80" : "text-[hsl(var(--sidebar-primary))]")}>
                          Today
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slot grid — only shown when date selected */}
            {form.scheduled_date && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">
                    Time Slots —{" "}
                    <span className="font-normal text-muted-foreground">
                      {new Date(form.scheduled_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                    </span>
                  </Label>
                  {loadingSlots && (
                    <div className="w-4 h-4 rounded-full border-2 border-[hsl(var(--sidebar-primary))]/30 border-t-[hsl(var(--sidebar-primary))] animate-spin" />
                  )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[hsl(var(--sidebar-primary))]" />
                    Selected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm border-2 border-border bg-background" />
                    Open
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300" />
                    Taken
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-muted" />
                    Break
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => {
                    const active  = form.scheduled_time === slot.label;
                    const taken   = !slot.blocked && slot.orders.length > 0;
                    const blocked = slot.blocked;

                    return (
                      <div key={slot.label} className="relative">
                        <button
                          disabled={blocked}
                          onClick={() => set("scheduled_time", active ? "" : slot.label)}
                          title={
                            blocked  ? `${slot.blockLabel} — unavailable` :
                            taken    ? slot.orders.map(o => `${o.customer_name} (${o.order_type})`).join(", ") :
                            undefined
                          }
                          className={cn(
                            "w-full py-2.5 px-1 rounded-xl border-2 text-xs font-semibold transition-all active:scale-95 flex flex-col items-center gap-0.5",
                            blocked
                              ? "bg-muted border-muted text-muted-foreground cursor-not-allowed opacity-50"
                              : active
                              ? "bg-[hsl(var(--sidebar-primary))] border-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"
                              : taken
                              ? "bg-amber-50 border-amber-300 text-amber-800 hover:border-amber-400 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700"
                              : "bg-background border-border text-foreground hover:border-[hsl(var(--sidebar-primary))]"
                          )}
                        >
                          <span>{blocked ? "—" : slot.label}</span>
                          {blocked && (
                            <span className="text-[9px] leading-tight text-center px-0.5">
                              {slot.blockLabel}
                            </span>
                          )}
                          {taken && !active && (
                            <span className="text-[9px] leading-tight font-normal">
                              {slot.orders.length} order{slot.orders.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </button>

                        {/* Taken indicator dot */}
                        {taken && !active && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-background" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Existing orders for selected date */}
                {dayOrders.length > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                        {dayOrders.length} order{dayOrders.length > 1 ? "s" : ""} already scheduled this day
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dayOrders.map((o) => (
                        <div key={o.id} className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400">
                          <span className="font-medium">
                            {o.order_type === "pickup" ? "🚛" : "📦"} {o.customer_name}
                          </span>
                          <span className="text-amber-600 dark:text-amber-500 font-mono">
                            {minutesToLabel(pgTimeToMinutes(o.scheduled_time))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warning if slot is taken but user selects it anyway */}
                {form.scheduled_time && !slots.find(s => s.label === form.scheduled_time)?.available && !slots.find(s => s.label === form.scheduled_time)?.blocked && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3">
                    <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      <strong>Heads up:</strong> This time already has an order. You can still book it — just make sure you have enough time between runs.
                    </p>
                  </div>
                )}
              </div>
            )}

            {!form.scheduled_date && (
              <button
                onClick={() => goTo(6, "fwd")}
                className="mt-2 text-sm text-muted-foreground underline underline-offset-2"
              >
                Skip — schedule later
              </button>
            )}
          </StepShell>
        )}

        {/* ── Step 6: Payment ── */}
        {step === 6 && (
          <StepShell
            title={isDelivery ? "Payment status?" : "No payment needed"}
            sub={isDelivery ? "How was this handled?" : "Pickups are free — just continue"}
          >
            {isDelivery ? (
              <div className="space-y-3">
                {([
                  { value: "paid",    label: "Paid in Full",    emoji: "✅", desc: "Customer already paid" },
                  { value: "partial", label: "Partial Payment", emoji: "🔶", desc: "Deposit or partial paid" },
                  { value: "unpaid",  label: "Pay on Delivery", emoji: "💵", desc: "Collect when we arrive" },
                  { value: "n/a",     label: "N/A",             emoji: "—",  desc: "Not applicable" },
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
                          : "border-border bg-background hover:border-[hsl(var(--sidebar-primary))]"
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
                <p className="text-muted-foreground">This is a donation pickup — no charge to the donor.</p>
              </div>
            )}
          </StepShell>
        )}

        {/* ── Step 7: Confirm ── */}
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

      {/* ── Error ── */}
      {error && (
        <div className="mt-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* ── Nav buttons ── */}
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

// ── Sub-components ────────────────────────────────────────────────────────────

function StepShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      {/* Cal.com's StepHeader pattern — font-cal + text-subtle */}
      <div className="mb-6">
        <p className="font-bold text-[22px] leading-tight text-foreground mb-1">{title}</p>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>
      {children}
    </div>
  );
}

function OptionCard({ selected, onClick, icon, label, desc }: {
  selected: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-5 w-full px-5 py-5 rounded-2xl border-2 text-left transition-all active:scale-95",
        selected
          ? "border-[hsl(var(--sidebar-primary))] bg-[hsl(var(--sidebar-primary)/0.08)]"
          : "border-border bg-background hover:border-[hsl(var(--sidebar-primary))]"
      )}
    >
      <div className={cn("shrink-0", selected ? "text-[hsl(var(--sidebar-primary))]" : "text-muted-foreground")}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={cn("font-bold text-base", selected ? "text-[hsl(var(--sidebar-primary))]" : "text-foreground")}>
          {label}
        </p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      {selected && <Check size={20} className="text-[hsl(var(--sidebar-primary))] shrink-0" />}
    </button>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="font-semibold text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="text-foreground break-words flex-1">{value}</span>
    </div>
  );
}