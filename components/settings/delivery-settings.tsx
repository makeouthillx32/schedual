"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Clock, Save, Plus, Trash2, ToggleLeft, ToggleRight, Search, ChevronDown, ChevronUp, Package, Truck, X, Check } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Types ──────────────────────────────────────────────────────────────────────

interface ScheduleBlock {
  id:         string;
  block_type: "break" | "lunch";
  start_time: string;
  end_time:   string;
  label:      string;
  is_active:  boolean;
}

interface OrderRecord {
  id:                      string;
  order_type:              string;
  status:                  string;
  customer_name:           string;
  customer_phone:          string | null;
  origin_address:          string | null;
  destination_address:     string | null;
  item_description:        string;
  item_notes:              string | null;
  scheduled_date:          string | null;
  scheduled_time:          string | null;
  taken_by:                string | null;
  payment_status:          string | null;
  payment_notes:           string | null;
  cancelled_reason:        string | null;
  created_at:              string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pgTo12h(t: string): string {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}
function inputToPg(t: string): string { return t.length === 5 ? `${t}:00` : t; }
function pgToInput(t: string): string { return t.slice(0, 5); }

const STATUS_COLORS: Record<string, string> = {
  pending:     "bg-amber-100 text-amber-800",
  assigned:    "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed:   "bg-green-100 text-green-800",
  cancelled:   "bg-red-100 text-red-800",
};

// ── Main component ─────────────────────────────────────────────────────────────

export default function DeliverySettings() {
  const [activeTab, setActiveTab] = useState<"blocks" | "orders">("blocks");

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Tab switcher */}
      <div className="flex border-b border-[hsl(var(--border))] mb-6">
        {([["blocks", "Schedule Blocks"], ["orders", "Order Audit"]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === id
                ? "border-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary))]"
                : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "blocks" ? <BlocksTab /> : <OrderAuditTab />}
    </div>
  );
}

// ── Blocks tab ─────────────────────────────────────────────────────────────────

function BlocksTab() {
  const [blocks,  setBlocks]  = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState<string | null>(null);
  const [toast,   setToast]   = useState<string | null>(null);

  useEffect(() => {
    supabase.from("delivery_schedule_blocks").select("*").order("start_time")
      .then(({ data }) => { if (data) setBlocks(data as ScheduleBlock[]); setLoading(false); });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const updateBlock = (id: string, field: keyof ScheduleBlock, value: string | boolean) =>
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, [field]: value } : b));

  const saveBlock = async (block: ScheduleBlock) => {
    setSaving(block.id);
    const { error } = await supabase.from("delivery_schedule_blocks")
      .update({ label: block.label, start_time: block.start_time, end_time: block.end_time, is_active: block.is_active, block_type: block.block_type })
      .eq("id", block.id);
    setSaving(null);
    if (error) { showToast("❌ Failed to save."); return; }
    showToast(`✓ ${block.label} saved`);
  };

  const toggleActive = async (block: ScheduleBlock) => {
    const next = !block.is_active;
    updateBlock(block.id, "is_active", next);
    await supabase.from("delivery_schedule_blocks").update({ is_active: next }).eq("id", block.id);
  };

  const deleteBlock = async (id: string) => {
    if (!window.confirm("Delete this block?")) return;
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    await supabase.from("delivery_schedule_blocks").delete().eq("id", id);
    showToast("Block removed");
  };

  const addBlock = async () => {
    const { data, error } = await supabase.from("delivery_schedule_blocks")
      .insert({ block_type: "break", start_time: "09:00:00", end_time: "09:10:00", label: "New Break", is_active: false })
      .select().single();
    if (!error && data) { setBlocks((prev) => [...prev, data as ScheduleBlock]); showToast("Block added"); }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
            <Clock size={20} className="text-[hsl(var(--sidebar-primary))]" />
            Schedule Blocks
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            Break and lunch windows — no deliveries scheduled during these times.
          </p>
        </div>
        <button onClick={addBlock}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded-lg hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors">
          <Plus size={14} /> Add Block
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-24 rounded-xl bg-[hsl(var(--muted))] animate-pulse" />)}</div>
      ) : blocks.length === 0 ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <Clock size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No blocks configured. Tap Add Block to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block) => (
            <div key={block.id} className={`rounded-xl border p-4 space-y-3 transition-all ${
              block.is_active ? "border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                              : "border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] opacity-60"
            }`}>
              {/* Label + type */}
              <div className="flex items-center gap-2">
                <input
                  value={block.label}
                  onChange={(e) => updateBlock(block.id, "label", e.target.value)}
                  className="flex-1 font-semibold text-sm bg-transparent border-b border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--sidebar-primary))] text-[hsl(var(--foreground))] pb-0.5"
                  placeholder="Block name"
                />
                <select
                  value={block.block_type}
                  onChange={(e) => updateBlock(block.id, "block_type", e.target.value)}
                  className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] border-0 cursor-pointer shrink-0">
                  <option value="break">Break</option>
                  <option value="lunch">Lunch</option>
                </select>
              </div>
              {/* Toggle + delete */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{block.is_active ? "Active" : "Disabled"}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleActive(block)}>
                    {block.is_active
                      ? <ToggleRight size={24} className="text-[hsl(var(--sidebar-primary))]" />
                      : <ToggleLeft  size={24} className="text-[hsl(var(--muted-foreground))]" />}
                  </button>
                  <button onClick={() => deleteBlock(block.id)} className="text-[hsl(var(--muted-foreground))] hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Start</label>
                  <input type="time" value={pgToInput(block.start_time)} onChange={(e) => updateBlock(block.id, "start_time", inputToPg(e.target.value))}
                    className="w-full mt-1 px-2 py-1.5 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--sidebar-primary))]" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">End</label>
                  <input type="time" value={pgToInput(block.end_time)} onChange={(e) => updateBlock(block.id, "end_time", inputToPg(e.target.value))}
                    className="w-full mt-1 px-2 py-1.5 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--sidebar-primary))]" />
                </div>
              </div>
              <p className="text-xs text-center text-[hsl(var(--muted-foreground))] font-medium">
                {pgTo12h(block.start_time)} → {pgTo12h(block.end_time)}
              </p>
              <button onClick={() => saveBlock(block)} disabled={saving === block.id}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors disabled:opacity-50">
                <Save size={12} />
                {saving === block.id ? "Saving…" : "Save Changes"}
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">Changes take effect immediately on the intake form.</p>
    </div>
  );
}

// ── Order Audit tab ────────────────────────────────────────────────────────────

function OrderAuditTab() {
  const [orders,     setOrders]     = useState<OrderRecord[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editField,  setEditField]  = useState<string | null>(null); // "orderId.fieldName"
  const [editValue,  setEditValue]  = useState("");
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  useEffect(() => {
    supabase.from("delivery_orders").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setOrders(data as OrderRecord[]); setLoading(false); });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const filtered = orders.filter((o) =>
    `${o.customer_name} ${o.item_description} ${o.status} ${o.scheduled_date ?? ""}`.toLowerCase()
      .includes(search.toLowerCase())
  );

  const startEdit = (orderId: string, field: string, current: string | null) => {
    setEditField(`${orderId}.${field}`);
    setEditValue(current ?? "");
  };

  const cancelEdit = () => { setEditField(null); setEditValue(""); };

  const saveField = async (orderId: string, field: string) => {
    setSaving(true);
    const updateVal = editValue.trim() === "" ? null : editValue.trim();
    const { error } = await supabase.from("delivery_orders")
      .update({ [field]: updateVal, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    setSaving(false);
    if (error) { showToast("❌ Save failed"); return; }
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, [field]: updateVal } : o));
    showToast("✓ Saved");
    cancelEdit();
  };

  const EDITABLE_FIELDS: { key: keyof OrderRecord; label: string; type?: string; options?: string[] }[] = [
    { key: "order_type",       label: "Order Type",   options: ["delivery", "pickup"] },
    { key: "status",           label: "Status",       options: ["pending","assigned","in_progress","completed","cancelled"] },
    { key: "customer_name",    label: "Customer Name" },
    { key: "customer_phone",   label: "Phone" },
    { key: "origin_address",   label: "Origin Address" },
    { key: "destination_address", label: "Destination Address" },
    { key: "item_description", label: "Items" },
    { key: "item_notes",       label: "Item Notes" },
    { key: "scheduled_date",   label: "Date",         type: "date" },
    { key: "taken_by",         label: "Taken By" },
    { key: "payment_status",   label: "Payment",      options: ["paid","partial","unpaid","n/a"] },
    { key: "payment_notes",    label: "Payment Notes" },
    { key: "cancelled_reason", label: "Cancel Reason" },
  ];

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Order Audit</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
          Find an order and fix any field — one save at a time.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, item, status, date…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--sidebar-primary))]"
        />
      </div>

      {/* Order list */}
      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map((i) => <div key={i} className="h-16 rounded-xl bg-[hsl(var(--muted))] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-12 text-sm text-[hsl(var(--muted-foreground))]">No orders found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => {
            const isOpen = expandedId === order.id;
            return (
              <div key={order.id} className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
                {/* Row header — tap to expand */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : order.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    order.order_type === "delivery" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-green-100 dark:bg-green-900/30"
                  }`}>
                    {order.order_type === "delivery"
                      ? <Package size={14} className="text-blue-600" />
                      : <Truck    size={14} className="text-green-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[hsl(var(--foreground))] truncate">{order.customer_name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                      {order.item_description}
                      {order.scheduled_date && ` · ${order.scheduled_date}`}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {order.status.replace("_", " ")}
                  </span>
                  {isOpen ? <ChevronUp size={15} className="shrink-0 text-[hsl(var(--muted-foreground))]" />
                           : <ChevronDown size={15} className="shrink-0 text-[hsl(var(--muted-foreground))]" />}
                </button>

                {/* Expanded field editor */}
                {isOpen && (
                  <div className="border-t border-[hsl(var(--border))] divide-y divide-[hsl(var(--border))]">
                    {EDITABLE_FIELDS.map(({ key, label, type, options }) => {
                      const fieldKey = `${order.id}.${key}`;
                      const isEditing = editField === fieldKey;
                      const currentVal = order[key] as string | null;

                      return (
                        <div key={key} className="flex items-start gap-3 px-4 py-3">
                          <div className="w-32 shrink-0 pt-0.5">
                            <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">{label}</span>
                          </div>

                          {isEditing ? (
                            <div className="flex-1 flex items-center gap-2">
                              {options ? (
                                <select
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="flex-1 px-2 py-1.5 text-sm border border-[hsl(var(--sidebar-primary))] rounded-lg bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:outline-none"
                                  autoFocus
                                >
                                  {options.map((o) => <option key={o} value={o}>{o}</option>)}
                                </select>
                              ) : (
                                <input
                                  type={type ?? "text"}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveField(order.id, key);
                                    if (e.key === "Escape") cancelEdit();
                                  }}
                                  className="flex-1 px-2 py-1.5 text-sm border border-[hsl(var(--sidebar-primary))] rounded-lg bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:outline-none"
                                  autoFocus
                                />
                              )}
                              <button
                                onClick={() => saveField(order.id, key)}
                                disabled={saving}
                                className="p-1.5 rounded-lg bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] hover:bg-[hsl(var(--sidebar-primary))]/90 disabled:opacity-50"
                              >
                                <Check size={14} />
                              </button>
                              <button onClick={cancelEdit} className="p-1.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]">
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(order.id, key, currentVal)}
                              className="flex-1 text-left text-sm text-[hsl(var(--foreground))] hover:text-[hsl(var(--sidebar-primary))] transition-colors min-h-[24px]"
                            >
                              {currentVal
                                ? <span>{currentVal}</span>
                                : <span className="text-[hsl(var(--muted-foreground))] italic text-xs">tap to set</span>}
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Read-only meta */}
                    <div className="px-4 py-2 bg-[hsl(var(--muted)/0.3)]">
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        ID: {order.id.slice(0, 8)}… · Created: {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}