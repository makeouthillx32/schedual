import React from "react";
import { Eye, FileSpreadsheet } from "lucide-react";
import { DartBuckConfig, DenomArtSlot, PAPER_SPECS } from "../types";

interface PreviewPanelProps {
  config: DartBuckConfig;
  setConfig: React.Dispatch<React.SetStateAction<DartBuckConfig>>;
  denomSlots: Record<string, DenomArtSlot>;
  previewCanvasRef: React.RefObject<HTMLCanvasElement>;
  sheetCanvasRef: React.RefObject<HTMLCanvasElement>;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  config,
  setConfig,
  denomSlots,
  previewCanvasRef,
  sheetCanvasRef,
}) => {
  const spec = PAPER_SPECS[config.paperSize] || PAPER_SPECS["11x12-14"];
  const totalBills = config.drawerBreakdown.bill20 + config.drawerBreakdown.bill10 + config.drawerBreakdown.bill5 + config.drawerBreakdown.bill1;

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-xl border border-border space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-2">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Live Monopoly Print Preview (${config.denomination} Bill)
          </h2>

          <div className="flex gap-1 bg-muted p-1 rounded-lg text-xs font-bold">
            <button
              onClick={() => setConfig((prev) => ({ ...prev, previewView: "card" }))}
              className={`px-3 py-1 rounded-md transition-all ${
                config.previewView === "card"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Single Bill (4" × 2")
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

        {/* Single Bill Denomination Selector */}
        {config.previewView === "card" && (
          <div className="flex items-center gap-2 text-xs font-bold bg-muted/50 p-2 rounded-lg">
            <span className="text-muted-foreground">Inspect Bill Denomination:</span>
            <div className="flex gap-1">
              {["20", "10", "5", "1"].map((denom) => (
                <button
                  key={denom}
                  onClick={() => setConfig((prev) => ({ ...prev, denomination: denom }))}
                  className={`px-2.5 py-1 rounded border transition-all ${
                    config.denomination === denom
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-input bg-background hover:bg-muted text-muted-foreground"
                  }`}
                >
                  ${denom}
                </button>
              ))}
            </div>
          </div>
        )}

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
            {totalBills} Bills Total across {Math.ceil(totalBills / spec.billsPerSheet)} Sheet(s)
          </span>
        </div>
      </div>
    </div>
  );
};
