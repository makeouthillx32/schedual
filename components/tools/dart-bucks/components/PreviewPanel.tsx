import React from "react";
import { Eye, FileSpreadsheet } from "lucide-react";
import { DartBuckConfig, DenomArtSlot } from "../types";

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
  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-xl border border-border space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Live Print & Grid Preview (${config.denomination} Bill)
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
              Single Card
            </button>
            <button
              onClick={() => setConfig((prev) => ({ ...prev, previewView: "sheet-front" }))}
              className={`px-3 py-1 rounded-md transition-all ${
                config.previewView === "sheet-front"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              A4 Front Grid
            </button>
            <button
              onClick={() => setConfig((prev) => ({ ...prev, previewView: "sheet-back" }))}
              className={`px-3 py-1 rounded-md transition-all ${
                config.previewView === "sheet-back"
                  ? "bg-background text-foreground shadow text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              A4 Back (Mirrored)
            </button>
          </div>
        </div>

        <div className="relative rounded-lg overflow-hidden border border-border bg-slate-950 p-3 flex items-center justify-center min-h-[340px]">
          {config.previewView === "card" ? (
            <canvas
              ref={previewCanvasRef}
              className="max-w-full h-auto rounded shadow-lg border border-slate-800"
            />
          ) : (
            <canvas
              ref={sheetCanvasRef}
              className="max-w-full h-auto max-h-[520px] rounded shadow-lg border border-slate-800"
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
              : "Default Monopoly Palette Preset"}
          </span>
        </div>
      </div>

      <div className="bg-card p-5 rounded-xl border border-border space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          Duplex Print Specifications
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="p-3 bg-muted/40 rounded-lg border border-border">
            <span className="block text-muted-foreground">Target Amount</span>
            <span className="text-sm font-bold text-emerald-600">${config.drawerAmount}</span>
          </div>
          <div className="p-3 bg-muted/40 rounded-lg border border-border">
            <span className="block text-muted-foreground">Page 1 Output</span>
            <span className="text-sm font-bold text-foreground">Drawer Audit Slip</span>
          </div>
          <div className="p-3 bg-muted/40 rounded-lg border border-border">
            <span className="block text-muted-foreground">Duplex Alignment</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Mirrored Col 0 ↔ 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
