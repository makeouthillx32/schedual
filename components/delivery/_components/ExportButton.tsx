"use client";

import { useState, useRef, useEffect } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Download, ChevronDown, FileSpreadsheet, Printer, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { DeliveryExportTemplate } from "@/lib/DeliveryExportTemplate";

interface DeliveryExportButtonProps {
  supabase: SupabaseClient;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getMonthOptions(count = 6) {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  const opts  = [];
  for (let i = 0; i < count; i++) {
    let m = month - i;
    let y = year;
    if (m <= 0) { m += 12; y -= 1; }
    opts.push({ month: m, year: y, label: `${MONTHS[m - 1]} ${y}`, isCurrent: i === 0 });
  }
  return opts;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href    = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type Mode = "month" | "year";

export default function DeliveryExportButton({ supabase }: DeliveryExportButtonProps) {
  const [open,          setOpen]          = useState(false);
  const [exporting,     setExporting]     = useState(false);
  const [mode,          setMode]          = useState<Mode>("month");
  const [selectedMonth, setSelectedMonth] = useState(getMonthOptions(6)[0]);
  const [selectedYear,  setSelectedYear]  = useState(new Date().getFullYear());

  const menuRef = useRef<HTMLDivElement>(null);
  const months  = getMonthOptions(6);
  const currentYear = new Date().getFullYear();

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
    try {
      if (mode === "month") {
        const tmpl = new DeliveryExportTemplate(supabase, selectedMonth.month, selectedMonth.year);
        await tmpl.fetchData();
        const monthStr = `${MONTHS[selectedMonth.month - 1]}_${selectedMonth.year}`;
        if (fmt === "excel") {
          const buf  = tmpl.generateExcel();
          downloadBlob(
            new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
            `DART_Delivery_${monthStr}.xlsx`
          );
        } else {
          const html = tmpl.generateHTML();
          downloadBlob(new Blob([html], { type: "text/html;charset=utf-8" }), `DART_Delivery_${monthStr}.html`);
        }
      } else {
        // ── Yearly ──
        if (fmt === "excel") {
          const buf = await DeliveryExportTemplate.generateYearlyExcel(supabase, selectedYear);
          downloadBlob(
            new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
            `DART_Delivery_${selectedYear}_Annual.xlsx`
          );
        } else {
          const html = await DeliveryExportTemplate.generateYearlyHTML(supabase, selectedYear);
          downloadBlob(new Blob([html], { type: "text/html;charset=utf-8" }), `DART_Delivery_${selectedYear}_Annual.html`);
        }
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-xs font-semibold hover:bg-[hsl(var(--accent))] transition-colors disabled:opacity-50"
      >
        {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
        {exporting ? "Exporting…" : "Export"}
        {!exporting && <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-68 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg overflow-hidden" style={{ width: 272 }}>

          {/* Mode toggle */}
          <div className="flex border-b border-[hsl(var(--border))]">
            {(["month", "year"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  mode === m
                    ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
                }`}
              >
                {m === "month" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>

          {/* Month selector */}
          {mode === "month" && (
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
                          isSelected ? "bg-white/20 text-white" : "bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]"
                        }`}>Current</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Year selector */}
          {mode === "year" && (
            <div className="px-3 pt-3 pb-2 border-b border-[hsl(var(--border))]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">
                Select Year
              </p>
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={() => setSelectedYear((y) => y - 1)}
                  className="p-1.5 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--foreground))]"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="text-center">
                  <span className="text-2xl font-bold text-[hsl(var(--foreground))]">{selectedYear}</span>
                  {selectedYear === currentYear && (
                    <p className="text-[9px] text-[hsl(var(--sidebar-primary))] font-semibold mt-0.5">Current Year</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedYear((y) => y + 1)}
                  disabled={selectedYear >= currentYear}
                  className="p-1.5 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--foreground))] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <p className="text-[10px] text-center text-[hsl(var(--muted-foreground))] mt-2">
                All 12 months · 1 workbook
              </p>
            </div>
          )}

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
                  {mode === "month" ? "Orders + Trash Runs · 3 sheets" : "Summary + 12 monthly sheets"}
                </p>
              </div>
            </button>
            <button
              onClick={() => runExport("print")}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors text-left"
            >
              <Printer size={15} className="text-[hsl(var(--muted-foreground))] shrink-0" />
              <div>
                <p className="font-semibold">Save / Share Report</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-normal">
                  {mode === "month" ? "1 month · iOS share sheet" : "Cover page + 12 months · iOS share sheet"}
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}