"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Clock, Save, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ScheduleBlock {
  id:         string;
  block_type: "break" | "lunch";
  start_time: string;
  end_time:   string;
  label:      string;
  is_active:  boolean;
}

function pgTo12h(t: string): string {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function inputToPg(t: string): string {
  return t.length === 5 ? `${t}:00` : t;
}

function pgToInput(t: string): string {
  return t.slice(0, 5);
}

export default function DeliverySettings() {
  const [blocks,  setBlocks]  = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState<string | null>(null);
  const [toast,   setToast]   = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("delivery_schedule_blocks")
      .select("*")
      .order("start_time")
      .then(({ data }) => {
        if (data) setBlocks(data as ScheduleBlock[]);
        setLoading(false);
      });
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const updateBlock = (id: string, field: keyof ScheduleBlock, value: string | boolean) => {
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, [field]: value } : b));
  };

  const saveBlock = async (block: ScheduleBlock) => {
    setSaving(block.id);
    const { error } = await supabase
      .from("delivery_schedule_blocks")
      .update({
        label:      block.label,
        start_time: block.start_time,
        end_time:   block.end_time,
        is_active:  block.is_active,
        block_type: block.block_type,
      })
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
    const { data, error } = await supabase
      .from("delivery_schedule_blocks")
      .insert({ block_type: "break", start_time: "09:00:00", end_time: "09:10:00", label: "New Break", is_active: false })
      .select()
      .single();
    if (!error && data) {
      setBlocks((prev) => [...prev, data as ScheduleBlock]);
      showToast("Block added — edit and save");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
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
        <button
          onClick={addBlock}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded-lg hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors"
        >
          <Plus size={14} /> Add Block
        </button>
      </div>

      {/* Blocks list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-24 rounded-xl bg-[hsl(var(--muted))] animate-pulse" />)}
        </div>
      ) : blocks.length === 0 ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <Clock size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No blocks configured. Tap Add Block to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block) => (
            <div
              key={block.id}
              className={`rounded-xl border p-4 space-y-3 transition-all ${
                block.is_active
                  ? "border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                  : "border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] opacity-60"
              }`}
            >
              {/* Label + type + toggle + delete */}
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
                  className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] border-0 cursor-pointer"
                >
                  <option value="break">Break</option>
                  <option value="lunch">Lunch</option>
                </select>
                <button onClick={() => toggleActive(block)} title={block.is_active ? "Disable" : "Enable"}>
                  {block.is_active
                    ? <ToggleRight size={22} className="text-[hsl(var(--sidebar-primary))]" />
                    : <ToggleLeft  size={22} className="text-[hsl(var(--muted-foreground))]" />}
                </button>
                <button onClick={() => deleteBlock(block.id)} title="Delete" className="text-[hsl(var(--muted-foreground))] hover:text-red-500 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Start → End time */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Start</label>
                  <input
                    type="time"
                    value={pgToInput(block.start_time)}
                    onChange={(e) => updateBlock(block.id, "start_time", inputToPg(e.target.value))}
                    className="w-full mt-1 px-2 py-1.5 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--sidebar-primary))]"
                  />
                </div>
                <span className="text-[hsl(var(--muted-foreground))] text-xs mt-4">→</span>
                <div className="flex-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">End</label>
                  <input
                    type="time"
                    value={pgToInput(block.end_time)}
                    onChange={(e) => updateBlock(block.id, "end_time", inputToPg(e.target.value))}
                    className="w-full mt-1 px-2 py-1.5 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--sidebar-primary))]"
                  />
                </div>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))] mt-4 whitespace-nowrap">
                  {pgTo12h(block.start_time)} – {pgTo12h(block.end_time)}
                </span>
              </div>

              {/* Save */}
              <button
                onClick={() => saveBlock(block)}
                disabled={saving === block.id}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors disabled:opacity-50"
              >
                <Save size={12} />
                {saving === block.id ? "Saving…" : "Save Changes"}
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
        Changes take effect immediately on the intake form.
      </p>
    </div>
  );
}