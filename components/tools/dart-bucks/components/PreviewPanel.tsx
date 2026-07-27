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
              Front Sheet Grid
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

        <div className="p-3 bg-muted/60 rounded-lg border border-border flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">
            Active Art Source for ${config.denomination} Bills:
          </span>
          <span className="font-mono font-bold text-primary">
            {denomSlots[config.denomination]?.image_url
              ? "Custom Client Artwork Assigned"
              : "Exact Monopoly Photo Palette"}
          </span>
        </div>
      </div>

      <div className="bg-card p-5 rounded-xl border border-border space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          Prepress Alignment & Grid Specifications
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="p-3 bg-muted/40 rounded-lg border border-border">
            <span className="block text-muted-foreground">Monopoly Bill Size</span>
            <span className="text-sm font-bold text-emerald-600">4.0" × 2.0" (101.6×50.8mm)</span>
          </div>
          <div className="p-3 bg-muted/40 rounded-lg border border-border">
            <span className="block text-muted-foreground">Sheet Grid Yield</span>
            <span className="text-sm font-bold text-foreground">{spec.billsPerSheet} Bills ({spec.cols}×{spec.rows})</span>
          </div>
          <div className="p-3 bg-muted/40 rounded-lg border border-border">
            <span className="block text-muted-foreground">Duplex Back Alignment</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Mirrored Col 0 ↔ {spec.cols - 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
