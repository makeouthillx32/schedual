"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, FileText, Printer, AlertCircle, RefreshCw, Wrench, User, ClipboardList } from "lucide-react";
import { useTheme } from "@/app/provider";

type NoteCategory = "general" | "contract" | "client" | "followup";

type NoteEntry = {
  id: string;
  text: string;
  category: NoteCategory;
  createdAt: string;
};

const CATEGORIES: { value: NoteCategory; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { value: "general",  label: "General",         icon: <ClipboardList size={13} />, color: "#6b7280", bg: "#6b728018" },
  { value: "contract", label: "Contract Change",  icon: <Wrench size={13} />,        color: "#d97706", bg: "#d9770618" },
  { value: "client",   label: "Client Issue",     icon: <User size={13} />,          color: "#dc2626", bg: "#dc262618" },
  { value: "followup", label: "Follow-Up Needed", icon: <RefreshCw size={13} />,     color: "#2563eb", bg: "#2563eb18" },
];

function todayKey() {
  const now = new Date();
  const pt = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  return `daily-notes-${pt.getFullYear()}-${String(pt.getMonth() + 1).padStart(2, "0")}-${String(pt.getDate()).padStart(2, "0")}`;
}

function formatDate() {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export default function DailyNotes() {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<NoteCategory>("general");
  const [loaded, setLoaded] = useState(false);

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(todayKey());
      if (saved) setNotes(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  // Persist on every change
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(todayKey(), JSON.stringify(notes));
    } catch {}
  }, [notes, loaded]);

  function addNote() {
    if (!text.trim()) return;
    setNotes(prev => [
      ...prev,
      { id: crypto.randomUUID(), text: text.trim(), category, createdAt: new Date().toISOString() },
    ]);
    setText("");
  }

  function removeNote(id: string) {
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const categoryMap = Object.fromEntries(CATEGORIES.map(c => [c.value, { label: c.label, color: c.color }]));

    const rows = notes.map((n, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#f8fafc"}; border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px; white-space:nowrap;">
          <span style="display:inline-block; padding:2px 10px; border-radius:999px; font-size:11px; font-weight:700;
            background:${categoryMap[n.category].color}22; color:${categoryMap[n.category].color};
            border:1px solid ${categoryMap[n.category].color}55; text-transform:uppercase; letter-spacing:0.5px;">
            ${categoryMap[n.category].label}
          </span>
        </td>
        <td style="padding:8px 12px; font-size:13px; color:#1e293b;">${n.text}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Daily Notes – ${formatDate()}</title>
      <style>body{font-family:Georgia,serif;padding:40px;color:#1e293b;} table{width:100%;border-collapse:collapse;}</style>
      </head><body>
        <div style="border-bottom:3px solid #1e293b; padding-bottom:16px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:flex-end;">
          <div>
            <div style="font-size:22px; font-weight:800; letter-spacing:-0.5px;">DART Commercial Services</div>
            <div style="font-size:14px; color:#475569; margin-top:2px;">Daily Field Notes</div>
          </div>
          <div style="text-align:right; font-size:13px; color:#475569;">
            <div style="font-weight:700; color:#1e293b; font-size:15px;">${formatDate()}</div>
          </div>
        </div>
        ${notes.length === 0
          ? '<p style="color:#6b7280; font-size:14px;">No notes recorded for today.</p>'
          : `<table>
              <thead><tr style="background:#f1f5f9;">
                <th style="padding:8px 12px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#475569; border-bottom:2px solid #cbd5e1;">Category</th>
                <th style="padding:8px 12px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#475569; border-bottom:2px solid #cbd5e1;">Note</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>`
        }
        <div style="margin-top:48px; border-top:2px solid #1e293b; padding-top:20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:32px;">
          ${["Technician Signature","Supervisor Review","Date Submitted"].map(l => `
            <div>
              <div style="border-bottom:1px solid #94a3b8; height:32px;"></div>
              <div style="font-size:10px; color:#94a3b8; margin-top:4px; text-transform:uppercase; letter-spacing:1px;">${l}</div>
            </div>`).join("")}
        </div>
        <div style="margin-top:24px; font-size:10px; color:#94a3b8; text-align:center;">DART Commercial Services · Confidential · ${todayKey().replace("daily-notes-","")}</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  const border = "border border-[hsl(var(--border))]";
  const card = isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--background))]";

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-[hsl(var(--sidebar-primary))]" />
          <span className="font-semibold text-[hsl(var(--foreground))]">
            Today's Notes
          </span>
          {notes.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[hsl(var(--sidebar-primary))]/15 text-[hsl(var(--sidebar-primary))]">
              {notes.length}
            </span>
          )}
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[hsl(var(--sidebar-primary-foreground))] bg-[hsl(var(--sidebar-primary))] hover:opacity-90 transition-opacity"
        >
          <Printer size={13} />
          Print
        </button>
      </div>

      {/* Input row */}
      <div className={`p-3 rounded-xl ${border} ${card} space-y-2`}>
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: category === c.value ? c.color : c.bg,
                color: category === c.value ? "#fff" : c.color,
                border: `1.5px solid ${c.color}55`,
              }}
            >
              {c.icon}
              {c.label}
            </button>
          ))}
        </div>

        {/* Text + Add */}
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] px-3 py-2 text-sm placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-primary))]/40"
            placeholder={
              category === "contract" ? "e.g. Contract updated — Tuesdays only starting next week" :
              category === "client"   ? "e.g. Client not on-site, will reschedule" :
              category === "followup" ? "e.g. Follow up with manager re: key access" :
              "e.g. Finished early, parking lot was blocked"
            }
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addNote()}
          />
          <button
            onClick={addNote}
            disabled={!text.trim()}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold text-[hsl(var(--sidebar-primary-foreground))] bg-[hsl(var(--sidebar-primary))] hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <Plus size={15} />
            Add
          </button>
        </div>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className={`rounded-xl ${border} ${card} px-4 py-8 text-center`}>
          <AlertCircle size={22} className="mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No notes yet for today.</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]/70 mt-1">Notes are saved automatically and reset each day.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notes.map(n => {
            const cat = CATEGORIES.find(c => c.value === n.category)!;
            const time = new Date(n.createdAt).toLocaleTimeString("en-US", {
              hour: "numeric", minute: "2-digit", hour12: true,
              timeZone: "America/Los_Angeles",
            });
            return (
              <li
                key={n.id}
                className={`flex items-start gap-3 p-3 rounded-xl ${border} ${card}`}
              >
                <span
                  className="mt-0.5 shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}44` }}
                >
                  {cat.icon}
                  <span className="hidden sm:inline">{cat.label}</span>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[hsl(var(--foreground))] leading-snug">{n.text}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{time}</p>
                </div>
                <button
                  onClick={() => removeNote(n.id)}
                  className="shrink-0 mt-0.5 text-[hsl(var(--muted-foreground))] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}