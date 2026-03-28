"use client";

import { useState, useRef, useEffect } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Download, ChevronDown, FileSpreadsheet, Printer, Loader2 } from "lucide-react";
import { DeliveryExportTemplate } from "@/lib/DeliveryExportTemplate";

interface DeliveryExportButtonProps {
  supabase: SupabaseClient;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

/** Returns the last `count` months including current, newest first */
function getMonthOptions(count = 6) {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1; // 1-based
  const opts  = [];
  for (let i = 0; i < count; i++) {
    let m = month - i;
    let y = year;
    if (m <= 0) { m += 12; y -= 1; }
    opts.push({ month: m, year: y, label: `${MONTHS[m - 1]} ${y}`, isCurrent: i === 0 });
  }
  return opts;
}

export default function DeliveryExportButton({ supabase }: DeliveryExportButtonProps) {
  const [open,       setOpen]       = useState(false);
  const [exporting,  setExporting]  = useState(false);
  const [format,     setFormat]     = useState<"excel" | "print" | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getMonthOptions(6)[0]);

  const menuRef = useRef<HTMLDivElement>(null);
  const months  = getMonthOptions(6);

  // Close on outside tap
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const runExport = async (fmt: "excel" | "print") => {
    setOpen(false);
    setExporting(true);
    setFormat(fmt);
    try {
      const tmpl = new DeliveryExportTemplate(supabase, selectedMonth.month, selectedMonth.year);
      await tmpl.fetchData();

      if (fmt === "excel") {
        const buf  = tmpl.generateExcel();
        const blob = new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `DART_Delivery_${MONTHS[selectedMonth.month - 1]}_${selectedMonth.year}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const html = tmpl.generateHTML();
        const win  = window.open("", "_blank");
        if (win) {
          win.document.write(html);
          win.document.close();
          win.focus();
          setTimeout(() => win.print(), 400);
        }
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
      setFormat(null);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-xs font-semibold hover:bg-[hsl(var(--accent))] transition-colors disabled:opacity-50"
      >
        {exporting ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Download size={13} />
        )}
        {exporting ? `Exporting…` : "Export"}
        {!exporting && <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-64 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg overflow-hidden">

          {/* Month selector */}
          <div className="px-3 pt-3 pb-2 border-b border-[hsl(var(--border))]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
              Select Month
            </p>
            <div className="flex flex-col gap-1">
              {months.map((m) => {
                const isSelected = m.month === selectedMonth.month && m.year === selectedMonth.year;
                return (
                  <button
                    key={`${m.year}-${m.month}`}
                    onClick={() => setSelectedMonth(m)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                      isSelected
                        ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"
                        : "hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
                    }`}
                  >
                    <span>{m.label}</span>
                    {m.isCurrent && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]"
                      }`}>
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format actions */}
          <div className="p-2 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] px-1 pb-1">
              Export as
            </p>
            <button
              onClick={() => runExport("excel")}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors text-left"
            >
              <FileSpreadsheet size={15} className="text-green-600 shrink-0" />
              <div>
                <p className="font-semibold">Download Excel</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-normal">
                  Orders + Trash Runs · 3 sheets
                </p>
              </div>
            </button>
            <button
              onClick={() => runExport("print")}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors text-left"
            >
              <Printer size={15} className="text-[hsl(var(--muted-foreground))] shrink-0" />
              <div>
                <p className="font-semibold">Print / Save PDF</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-normal">
                  DART-branded summary report
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}