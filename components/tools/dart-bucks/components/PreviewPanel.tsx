import React, { useState } from "react";
import { Eye, FileSpreadsheet, ChevronLeft, ChevronRight, Layers, Sparkles } from "lucide-react";
import { DartBuckConfig, DenomArtSlot, PAPER_SPECS } from "../types";

interface PreviewPanelProps {
  config: DartBuckConfig;
  setConfig: React.Dispatch<React.SetStateAction<DartBuckConfig>>;
  denomSlots: Record<string, DenomArtSlot>;
  previewCanvasRef: React.RefObject<HTMLCanvasElement>;
  sheetCanvasRef: React.RefObject<HTMLCanvasElement>;
  currentBillIndex?: number;
  onBillIndexChange?: (index: number) => void;
  currentPageIndex?: number;
  onPageIndexChange?: (page: number) => void;
  totalDrawerBills?: number;
  totalPages?: number;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  config,
  setConfig,
  previewCanvasRef,
  sheetCanvasRef,
  currentBillIndex = 0,
  onBillIndexChange,
  currentPageIndex = 0,
  onPageIndexChange,
  totalDrawerBills = 19,
  totalPages = 2,
}) => {
  const spec = PAPER_SPECS[config.paperSize] || PAPER_SPECS["11x12-14"];

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-xl border border-border space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-2">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Live Prepress Preview (${config.denomination} Bill)
          </h2>

          {/* Mode View Switcher */}
          <div className="flex gap-1 bg-muted p-1 rounded-lg text-xs font-bold">
            <button
              onClick={() => setConfig((prev) => ({ ...prev, previewView: "card" }))}
              className={`px-3 py-1 rounded-md transition-all ${
                config.previewView === "card"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Single Bill Inspector
            </button>
            <button
              onClick={() => setConfig((prev) => ({ ...prev, previewView: "sheet-front" }))}
              className={`px-3 py-1 rounded-md transition-all ${
                config.previewView === "sheet-front"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Drawer Sheet Front
            </button>
            <button
              onClick={() => setConfig((prev) => ({ ...prev, previewView: "sheet-back" }))}
              className={`px-3 py-1 rounded-md transition-all ${
                config.previewView === "sheet-back"
                  ? "bg-background text-foreground shadow text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Back Mirrored Grid
            </button>
          </div>
        </div>

        {/* SINGLE BILL STACK CAROUSEL INSPECTOR */}
        {config.previewView === "card" && (
          <div className="flex flex-wrap justify-between items-center gap-2 bg-muted/60 p-2.5 rounded-xl border border-border text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>Denomination Quick Inspector:</span>
            </div>

            <div className="flex items-center gap-1.5">
              {["20", "10", "5", "1"].map((denom) => {
                const count = config.drawerBreakdown[`bill${denom}` as keyof typeof config.drawerBreakdown] || 0;
                const isSelected = config.denomination === denom;
                return (
                  <button
                    key={denom}
                    onClick={() => setConfig((prev) => ({ ...prev, denomination: denom }))}
                    className={`px-2.5 py-1 rounded-md font-bold text-xs border transition-all flex items-center gap-1 ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow"
                        : "border-input bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <span>${denom}</span>
                    <span className="opacity-80 text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SHEET PREVIEW PAGE NAVIGATOR */}
        {config.previewView !== "card" && totalPages > 1 && onPageIndexChange && (
          <div className="flex justify-between items-center bg-muted/60 p-2.5 rounded-xl border border-border text-xs">
            <span className="font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Prepress Sheet Page Navigator:
            </span>

            <div className="flex items-center gap-2 font-bold">
              <button
                disabled={currentPageIndex === 0}
                onClick={() => onPageIndexChange(currentPageIndex - 1)}
                className="p-1 rounded bg-background border border-input hover:bg-muted disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs">
                Sheet {currentPageIndex + 1} of {totalPages}
              </span>
              <button
                disabled={currentPageIndex >= totalPages - 1}
                onClick={() => onPageIndexChange(currentPageIndex + 1)}
                className="p-1 rounded bg-background border border-input hover:bg-muted disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CANVAS PREVIEW CONTAINER */}
        <div className="relative rounded-lg overflow-hidden border border-border bg-slate-950 p-4 flex items-center justify-center min-h-[340px]">
          {config.previewView === "card" ? (
            <canvas
              ref={previewCanvasRef}
              className="max-w-full h-auto rounded shadow-2xl border border-slate-800"
            />
          ) : (
            <canvas
              ref={sheetCanvasRef}
              className="max-w-full h-auto max-h-[540px] rounded shadow-2xl border border-slate-800"
            />
          )}
        </div>
      </div>

      {/* Itemized Cash Drawer Breakdown Table */}
      <div className="bg-card p-5 rounded-xl border border-border space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          Itemized Cash Drawer Allotment & Prepress Grid (${config.drawerAmount} Total)
        </h3>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <span className="block text-[10px] text-muted-foreground font-semibold">$20 Bills</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {config.drawerBreakdown.bill20} Bills (${config.drawerBreakdown.bill20 * 20})
            </span>
          </div>

          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <span className="block text-[10px] text-muted-foreground font-semibold">$10 Bills</span>
            <span className="text-base font-bold text-amber-600 dark:text-amber-400">
              {config.drawerBreakdown.bill10} Bills (${config.drawerBreakdown.bill10 * 10})
            </span>
          </div>

          <div className="p-2.5 bg-pink-500/10 border border-pink-500/30 rounded-lg">
            <span className="block text-[10px] text-muted-foreground font-semibold">$5 Bills</span>
            <span className="text-base font-bold text-pink-600 dark:text-pink-400">
              {config.drawerBreakdown.bill5} Bills (${config.drawerBreakdown.bill5 * 5})
            </span>
          </div>

          <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <span className="block text-[10px] text-muted-foreground font-semibold">$1 Bills</span>
            <span className="text-base font-bold text-yellow-600 dark:text-yellow-400">
              {config.drawerBreakdown.bill1} Bills (${config.drawerBreakdown.bill1})
            </span>
          </div>
        </div>

        <div className="p-3 bg-muted/40 rounded-lg border border-border flex justify-between items-center text-xs">
          <span className="text-muted-foreground font-medium">
            Total Allotted Currency Yield:
          </span>
          <span className="font-mono font-bold text-foreground">
            {totalDrawerBills} Bills Total across {totalPages} Prepress Sheet(s)
          </span>
        </div>
      </div>
    </div>
  );
};
