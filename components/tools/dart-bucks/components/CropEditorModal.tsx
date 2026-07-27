import React, { useRef, useEffect } from "react";
import { Scissors, AlertTriangle, Save } from "lucide-react";

interface CropEditorModalProps {
  denom: "1" | "5" | "10" | "20";
  imageSrc: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  fitMode: "cover" | "contain" | "stretch";
  onZoomChange: (val: number) => void;
  onOffsetXChange: (val: number) => void;
  onOffsetYChange: (val: number) => void;
  onFitModeChange: (mode: "cover" | "contain" | "stretch") => void;
  onClose: () => void;
  onSave: () => void;
  cropCanvasRef: React.RefObject<HTMLCanvasElement>;
}

export const CropEditorModal: React.FC<CropEditorModalProps> = ({
  denom,
  imageSrc,
  zoom,
  offsetX,
  offsetY,
  fitMode,
  onZoomChange,
  onOffsetXChange,
  onOffsetYChange,
  onFitModeChange,
  onClose,
  onSave,
  cropCanvasRef,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-4xl p-6 rounded-2xl border border-border shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Scissors className="w-6 h-6 text-red-500" />
              Crop & Stretch Editor (${denom} Bill Art Slot)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Fit, zoom, and stretch custom artwork to 1200 × 469 px resolution.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
          >
            Cancel
          </button>
        </div>

        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>
            <strong>Warning (No Undo / Redo):</strong> Once saved, the cropped areas outside the 1200×469 frame will be permanently saved to the database slot for ${denom} bills!
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground block">
            Target Resolution Preview (1200 × 469 px):
          </label>
          <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2 flex items-center justify-center">
            <canvas
              ref={cropCanvasRef}
              className="max-w-full h-auto rounded border border-slate-800"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-muted/40 p-4 rounded-xl border border-border">
          <div>
            <label className="font-bold text-muted-foreground block mb-2">Scaling / Fit Mode</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: "cover", label: "Cover" },
                { id: "contain", label: "Fit" },
                { id: "stretch", label: "Stretch" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => onFitModeChange(f.id as any)}
                  className={`py-1.5 px-2 rounded font-bold transition-all ${
                    fitMode === f.id
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-background border border-input text-muted-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-muted-foreground block mb-1">
              Zoom Scale: {zoom.toFixed(2)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.05"
              value={zoom}
              disabled={fitMode === "stretch"}
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <label className="font-bold text-muted-foreground block mb-1">
              Horizontal Offset: {offsetX}px
            </label>
            <input
              type="range"
              min="-600"
              max="600"
              step="10"
              value={offsetX}
              disabled={fitMode === "stretch"}
              onChange={(e) => onOffsetXChange(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
          >
            Discard Changes
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            Save & Assign to ${denom} Bills
          </button>
        </div>
      </div>
    </div>
  );
};
