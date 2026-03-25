"use client";

import { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, CheckCircle2, Circle } from "lucide-react";
import { TrashRun } from "@/components/delivery/_components/types";

interface TrashRunsPanelProps {
  supabase: SupabaseClient;
  isDark:   boolean;
  runs:     TrashRun[];
  onToggle: (run: TrashRun) => void;
  onAdd:    (note: string) => Promise<void>;
}

/**
 * Today's trash run log — scoped to Pacific Time day in DriverBoard.
 * Handles its own modal state so DriverBoard stays clean.
 */
export function TrashRunsPanel({ supabase, isDark, runs, onToggle, onAdd }: TrashRunsPanelProps) {
  const [showModal,   setShowModal]   = useState(false);
  const [note,        setNote]        = useState("");
  const [adding,      setAdding]      = useState(false);

  const handleAdd = async () => {
    if (adding) return;
    setAdding(true);
    try {
      await onAdd(note.trim());
      setNote("");
      setShowModal(false);
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <div className={`rounded-lg border border-[hsl(var(--border))] overflow-hidden ${isDark ? "bg-[hsl(var(--card))]" : "bg-[hsl(var(--background))]"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <Trash2 size={16} className="text-[hsl(var(--muted-foreground))]" />
            <span className="font-semibold text-sm text-[hsl(var(--foreground))]">Trash Runs</span>
            <Badge variant="secondary">{runs.filter((r) => r.status === "pending").length} pending</Badge>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1 text-sm bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors flex items-center gap-1"
          >
            <Plus size={14} /> Add Run
          </button>
        </div>

        {/* List */}
        {runs.length === 0 ? (
          <p className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">No trash runs logged today.</p>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {runs.map((run) => (
              <div key={run.id} className="flex items-start space-x-3 px-4 py-3">
                <button onClick={() => onToggle(run)} className="mt-0.5 hover:scale-110 transition-transform shrink-0">
                  {run.status === "done"
                    ? <CheckCircle2 size={20} className="text-green-600" />
                    : <Circle      size={20} className="text-[hsl(var(--muted-foreground))]" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${run.status === "done" ? "line-through text-[hsl(var(--muted-foreground))]" : "text-[hsl(var(--foreground))]"}`}>
                    {run.note ?? "Trash run to dump"}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                    {run.status === "done"
                      ? `✓ Done ${run.completed_at ? new Date(run.completed_at).toLocaleTimeString() : ""}`
                      : new Date(run.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className={`w-full max-w-md rounded-lg p-6 ${isDark ? "bg-[hsl(var(--card))]" : "bg-white"}`}>
            <h4 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">Log Trash Run</h4>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-[hsl(var(--foreground))]">Notes (optional)</label>
              <input
                type="text"
                placeholder="e.g. 3 bags from back dock, fridge from floor"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                autoFocus
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => { setShowModal(false); setNote(""); }}
                className="flex-1 px-4 py-2 border border-[hsl(var(--border))] rounded text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={adding}
                className={`flex-1 px-4 py-2 bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors flex items-center justify-center gap-1 ${adding ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Plus size={16} /> {adding ? "Adding…" : "Add Run"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}