import React from "react";
import { Sliders, Calculator, DollarSign, ShieldCheck, RefreshCw } from "lucide-react";
import { DartBuckConfig } from "../types";

interface DrawerCalculatorControlsProps {
  config: DartBuckConfig;
  setConfig: React.Dispatch<React.SetStateAction<DartBuckConfig>>;
  onDrawerAmountChange: (amount: number) => void;
  onWeightingChange: (weighting: "balanced" | "heavy" | "light") => void;
  onRegenerateBatchId: () => void;
}

export const DrawerCalculatorControls: React.FC<DrawerCalculatorControlsProps> = ({
  config,
  setConfig,
  onDrawerAmountChange,
  onWeightingChange,
  onRegenerateBatchId,
}) => {
  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="bg-card p-5 rounded-xl border border-border space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Sliders className="w-5 h-5 text-blue-500" />
          Generation Mode
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setConfig((prev) => ({ ...prev, mode: "drawer" }))}
            className={`py-2.5 px-3 text-xs font-bold rounded-md border flex items-center justify-center gap-2 transition-all ${
              config.mode === "drawer"
                ? "border-primary bg-primary/10 text-primary"
                : "border-input bg-background hover:bg-muted text-muted-foreground"
            }`}
          >
            <Calculator className="w-4 h-4" />
            Cash Drawer Mode ($200/$250)
          </button>

          <button
            onClick={() => setConfig((prev) => ({ ...prev, mode: "single" }))}
            className={`py-2.5 px-3 text-xs font-bold rounded-md border flex items-center justify-center gap-2 transition-all ${
              config.mode === "single"
                ? "border-primary bg-primary/10 text-primary"
                : "border-input bg-background hover:bg-muted text-muted-foreground"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Single Denomination Batch
          </button>
        </div>
      </div>

      {/* Cash Drawer Calculator Allotment */}
      {config.mode === "drawer" && (
        <div className="bg-card p-5 rounded-xl border border-border space-y-4 shadow-sm bg-emerald-500/5">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <Calculator className="w-5 h-5 text-emerald-600" />
            Cash Drawer Allotment Calculator
          </h2>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Target Cash Amount Per Drawer ($)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-muted-foreground">$</span>
                <input
                  type="number"
                  min="1"
                  step="5"
                  value={config.drawerAmount}
                  onChange={(e) => onDrawerAmountChange(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 text-base font-bold bg-background border border-input rounded-md"
                />
              </div>
              <button
                onClick={() => onDrawerAmountChange(200)}
                className="px-3 py-2 text-xs font-bold bg-secondary text-secondary-foreground rounded-md border border-input"
              >
                $200 Preset
              </button>
              <button
                onClick={() => onDrawerAmountChange(250)}
                className="px-3 py-2 text-xs font-bold bg-secondary text-secondary-foreground rounded-md border border-input"
              >
                $250 Preset
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Bill Weighting Preference
            </label>
            <div className="grid grid-cols-3 gap-1 text-xs">
              {[
                { id: "balanced", label: "Balanced" },
                { id: "heavy", label: "Heavy ($20s)" },
                { id: "light", label: "Light ($1s)" },
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => onWeightingChange(w.id as any)}
                  className={`py-1.5 px-2 text-[11px] font-bold rounded border transition-all ${
                    config.drawerWeighting === w.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-background hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <span className="text-xs font-semibold text-muted-foreground">Allotted Bill Breakdown:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-emerald-500/10 rounded-md border border-emerald-500/30 flex justify-between items-center">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">$20 Bills</span>
                <input
                  type="number"
                  min="0"
                  value={config.drawerBreakdown.bill20}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      drawerWeighting: "custom",
                      drawerBreakdown: { ...prev.drawerBreakdown, bill20: parseInt(e.target.value) || 0 },
                    }))
                  }
                  className="w-16 px-1 py-0.5 text-right font-mono font-bold bg-background border border-input rounded"
                />
              </div>

              <div className="p-2.5 bg-amber-500/10 rounded-md border border-amber-500/30 flex justify-between items-center">
                <span className="font-bold text-amber-800 dark:text-amber-300">$10 Bills</span>
                <input
                  type="number"
                  min="0"
                  value={config.drawerBreakdown.bill10}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      drawerWeighting: "custom",
                      drawerBreakdown: { ...prev.drawerBreakdown, bill10: parseInt(e.target.value) || 0 },
                    }))
                  }
                  className="w-16 px-1 py-0.5 text-right font-mono font-bold bg-background border border-input rounded"
                />
              </div>

              <div className="p-2.5 bg-pink-500/10 rounded-md border border-pink-500/30 flex justify-between items-center">
                <span className="font-bold text-pink-800 dark:text-pink-300">$5 Bills</span>
                <input
                  type="number"
                  min="0"
                  value={config.drawerBreakdown.bill5}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      drawerWeighting: "custom",
                      drawerBreakdown: { ...prev.drawerBreakdown, bill5: parseInt(e.target.value) || 0 },
                    }))
                  }
                  className="w-16 px-1 py-0.5 text-right font-mono font-bold bg-background border border-input rounded"
                />
              </div>

              <div className="p-2.5 bg-yellow-500/10 rounded-md border border-yellow-500/30 flex justify-between items-center">
                <span className="font-bold text-yellow-800 dark:text-yellow-300">$1 Bills</span>
                <input
                  type="number"
                  min="0"
                  value={config.drawerBreakdown.bill1}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      drawerWeighting: "custom",
                      drawerBreakdown: { ...prev.drawerBreakdown, bill1: parseInt(e.target.value) || 0 },
                    }))
                  }
                  className="w-16 px-1 py-0.5 text-right font-mono font-bold bg-background border border-input rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security & Serial Batch Settings */}
      <div className="bg-card p-5 rounded-xl border border-border space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          Batch Security & Serial Numbers
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Station Prefix
            </label>
            <input
              type="text"
              value={config.stationPrefix}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  stationPrefix: e.target.value.toUpperCase(),
                }))
              }
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Batch Hash
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                value={config.batchId}
                readOnly
                className="w-full px-3 py-2 text-sm font-mono bg-muted text-foreground border border-input rounded-md"
              />
              <button
                onClick={onRegenerateBatchId}
                className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
