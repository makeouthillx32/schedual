"use client";

import { useState, useEffect, useRef } from "react";
import { Printer, Plus, Trash2, Save, FileText, AlertCircle } from "lucide-react";

type CleanItem = {
  id: number;
  business_id: number;
  business_name: string;
  address: string;
  status: "pending" | "cleaned" | "missed" | "moved";
  notes?: string;
  before_open?: boolean;
  cleaned_at?: string;
  moved_to_date?: string;
};

type NoteEntry = {
  id: string;
  text: string;
  category: "general" | "contract" | "client" | "followup";
};

const CATEGORY_LABELS: Record<NoteEntry["category"], string> = {
  general: "General",
  contract: "Contract Change",
  client: "Client Issue",
  followup: "Follow-Up Needed",
};

const CATEGORY_COLORS: Record<NoteEntry["category"], string> = {
  general: "#6b7280",
  contract: "#d97706",
  client: "#dc2626",
  followup: "#2563eb",
};

export default function DailyReport() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const isoDate = today.toISOString().split("T")[0];

  const [items, setItems] = useState<CleanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [newNote, setNewNote] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState<NoteEntry["category"]>("general");
  const [reportTitle, setReportTitle] = useState("Daily Field Report");
  const [preparedBy, setPreparedBy] = useState("DART Commercial Services");
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch today's clean track data
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const dayName = today.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
        // Calculate week number (simple ISO-like week)
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const week = Math.ceil(
          ((today.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
        );

        const res = await fetch(
          `/api/schedule/daily-instances?date=${isoDate}&week=${week}&day=${dayName}`
        );
        if (!res.ok) throw new Error("Failed to load today's schedule");
        const data = await res.json();
        setItems(data.items || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addNote() {
    if (!newNote.trim()) return;
    setNotes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: newNote.trim(), category: newNoteCategory },
    ]);
    setNewNote("");
  }

  function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function handlePrint() {
    window.print();
  }

  const cleaned = items.filter((i) => i.status === "cleaned");
  const missed = items.filter((i) => i.status === "missed");
  const moved = items.filter((i) => i.status === "moved");
  const pending = items.filter((i) => i.status === "pending");

  return (
    <>
      {/* ── Screen-only controls ── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: fixed;
            top: 0; left: 0;
            width: 100%;
            padding: 32px 40px;
            font-family: 'Georgia', serif;
          }
          .no-print { display: none !important; }
          .print-page-break { page-break-after: always; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header controls */}
        <div className="no-print flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Daily Report</h1>
            <p className="text-sm text-[var(--muted)] mt-1">{dateStr}</p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--primary, #2563eb)" }}
          >
            <Printer size={16} />
            Print Report
          </button>
        </div>

        {/* Editable header fields (screen only) */}
        <div className="no-print grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              Report Title
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              Prepared By
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
            />
          </div>
        </div>

        {/* Notes input (screen only) */}
        <div className="no-print p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">
            Add Notes
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm shrink-0"
              value={newNoteCategory}
              onChange={(e) => setNewNoteCategory(e.target.value as NoteEntry["category"])}
            >
              {(Object.keys(CATEGORY_LABELS) as NoteEntry["category"][]).map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
            <input
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              placeholder="Type a note… (e.g. Client not on-site, contract updated for Tues)"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
            />
            <button
              onClick={addNote}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shrink-0"
              style={{ background: "var(--primary, #2563eb)" }}
            >
              <Plus size={15} />
              Add
            </button>
          </div>

          {notes.length > 0 && (
            <ul className="space-y-2 pt-1">
              {notes.map((n) => (
                <li key={n.id} className="flex items-start gap-2">
                  <span
                    className="mt-0.5 inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                    style={{ background: CATEGORY_COLORS[n.category] }}
                  >
                    {CATEGORY_LABELS[n.category]}
                  </span>
                  <span className="flex-1 text-sm text-[var(--text)]">{n.text}</span>
                  <button onClick={() => removeNote(n.id)} className="text-[var(--muted)] hover:text-red-500 mt-0.5">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ═══════════════════════════════════════
            PRINTABLE AREA
        ═══════════════════════════════════════ */}
        <div id="print-area" ref={printRef}>
          {/* Report header */}
          <div
            style={{
              borderBottom: "3px solid #1e293b",
              paddingBottom: "16px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" }}>
                DART Commercial Services
              </div>
              <div style={{ fontSize: "14px", color: "#475569", marginTop: "2px" }}>
                {reportTitle}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "13px", color: "#475569" }}>
              <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "15px" }}>{dateStr}</div>
              <div>Prepared by: {preparedBy}</div>
            </div>
          </div>

          {/* Summary row */}
          {!loading && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
                marginBottom: "28px",
              }}
            >
              {[
                { label: "Cleaned", count: cleaned.length, color: "#16a34a" },
                { label: "Missed", count: missed.length, color: "#dc2626" },
                { label: "Moved", count: moved.length, color: "#d97706" },
                { label: "Pending", count: pending.length, color: "#6b7280" },
              ].map(({ label, count, color }) => (
                <div
                  key={label}
                  style={{
                    border: `2px solid ${color}`,
                    borderRadius: "8px",
                    padding: "10px 14px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "26px", fontWeight: 800, color }}>{count}</div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Businesses table */}
          <div style={{ marginBottom: "32px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: "#64748b",
                marginBottom: "10px",
              }}
            >
              Businesses Serviced Today
            </div>

            {loading ? (
              <p style={{ color: "#6b7280", fontSize: "14px" }}>Loading schedule…</p>
            ) : error ? (
              <p style={{ color: "#dc2626", fontSize: "14px" }}>⚠ {error} — schedule shown below may be incomplete.</p>
            ) : items.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: "14px" }}>No businesses scheduled for today.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Business</th>
                    <th style={thStyle}>Address</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Notes / Details</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        background: idx % 2 === 0 ? "#fff" : "#f8fafc",
                      }}
                    >
                      <td style={tdStyle}>{idx + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{item.business_name}</td>
                      <td style={{ ...tdStyle, color: "#64748b" }}>{item.address || "—"}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            background: statusBg(item.status),
                            color: statusFg(item.status),
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: "#64748b" }}>
                        {item.status === "moved" && item.moved_to_date
                          ? `Moved to ${item.moved_to_date}`
                          : item.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Notes section */}
          {notes.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: "#64748b",
                  marginBottom: "12px",
                }}
              >
                Field Notes & Updates
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((n, idx) => (
                    <tr
                      key={n.id}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        background: idx % 2 === 0 ? "#fff" : "#f8fafc",
                      }}
                    >
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: CATEGORY_COLORS[n.category] + "22",
                            color: CATEGORY_COLORS[n.category],
                            border: `1px solid ${CATEGORY_COLORS[n.category]}66`,
                          }}
                        >
                          {CATEGORY_LABELS[n.category]}
                        </span>
                      </td>
                      <td style={tdStyle}>{n.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Signature line */}
          <div
            style={{
              borderTop: "2px solid #1e293b",
              paddingTop: "20px",
              marginTop: "16px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "32px",
            }}
          >
            {["Technician Signature", "Supervisor Review", "Date Submitted"].map((label) => (
              <div key={label}>
                <div style={{ borderBottom: "1px solid #94a3b8", height: "32px" }} />
                <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "24px", fontSize: "10px", color: "#94a3b8", textAlign: "center" }}>
            DART Commercial Services · Confidential Field Report · {isoDate}
          </div>
        </div>
        {/* end print area */}
      </div>
    </>
  );
}

// ── style helpers ──
const thStyle: React.CSSProperties = {
  padding: "8px 10px",
  textAlign: "left",
  fontWeight: 700,
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  color: "#475569",
  borderBottom: "2px solid #cbd5e1",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
  verticalAlign: "top",
};

function statusBg(s: string) {
  return { cleaned: "#dcfce7", missed: "#fee2e2", moved: "#fef9c3", pending: "#f1f5f9" }[s] ?? "#f1f5f9";
}
function statusFg(s: string) {
  return { cleaned: "#16a34a", missed: "#dc2626", moved: "#92400e", pending: "#64748b" }[s] ?? "#64748b";
}