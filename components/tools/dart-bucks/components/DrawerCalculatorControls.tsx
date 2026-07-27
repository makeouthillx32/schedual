import React from "react";
import { Sliders, Calculator, DollarSign, ShieldCheck, RefreshCw, Printer, Crop, Calendar, Trash2, Palette } from "lucide-react";
import { DartBuckConfig, PAPER_SPECS, PaperSizePreset, MONTHS } from "../types";
import { MONTHLY_PALETTES } from "../utils/svgGenerator";

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
  const currentMonthIdx = new Date().getMonth();
  const activeMonthIdx = typeof config.monthOverride === "number" ? config.monthOverride : currentMonthIdx;
  const activePalette = MONTHLY_PALETTES[activeMonthIdx];

  return (
    <div className="space-y-6">
      {/* 12-Month Color Palette Engine Selector */}
      <div className="bg-card p-5 rounded-xl border border-border space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Palette className="w-5 h-5 text-purple-500" />
          12-Month Monopoly Color Palette Engine
        </h2>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            Select Active Issue Month & Palette Theme
          </label>
          <select
            value={typeof config.monthOverride === "number" ? config.monthOverride : "auto"}
            onChange={(e) => {
              const val = e.target.value;
              setConfig((prev) => ({
                ...prev,
                monthOverride: val === "auto" ? undefined : parseInt(val, 10),
              }));
            }}
            className="w-full px-3 py-2.5 bg-background border border-input rounded-lg font-bold text-xs"
          >
            <option value="auto">
              Auto System Date ({MONTHS[currentMonthIdx]} - {MONTHLY_PALETTES[currentMonthIdx].name})
            </option>
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx}>
                {m} Edition — {MONTHLY_PALETTES[idx].name}
              </option>
            ))}
          </select>
        </div>

        {/* Color Palette Preview Swatches */}
        <div className="p-3 bg-muted/50 rounded-lg border border-border space-y-2 text-xs">
          <div className="flex justify-between items-center font-bold text-foreground">
            <span>{activePalette.name} Color Swatches</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {typeof config.monthOverride === "number" ? "Custom Month Override" : "Auto Live System Month"}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
            {["1", "5", "10", "20"].map((denom) => {
              const colors = activePalette.denoms[denom];
              return (
                <div key={denom} className="p-1.5 rounded-md border flex flex-col items-center gap-1 shadow-xs" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                  <span style={{ color: colors.text }}>${denom}</span>
                  <div className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: colors.circleBg }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

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

      {/* PAPER SIZE & PREPRESS PRINT SETTINGS */}
      <div className="bg-card p-5 rounded-xl border border-border space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Printer className="w-5 h-5 text-indigo-500" />
          Paper Stock & Cutting Prepress Specs
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Target Paper Sheet Size
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(Object.keys(PAPER_SPECS) as PaperSizePreset[]).map((key) => {
                const spec = PAPER_SPECS[key];
                const isSelected = config.paperSize === key;
                return (
                  <button
                    key={key}
                    onClick={() => setConfig((prev) => ({ ...prev, paperSize: key }))}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-input bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="text-xs font-bold truncate">{spec.label}</span>
                    <span className="text-[10px] opacity-80 mt-1">
                      {spec.billsPerSheet} Bills ({spec.cols}×{spec.rows} Grid)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-foreground">
              <input
                type="checkbox"
                checked={config.includeCropMarks}
                onChange={(e) => setConfig((prev) => ({ ...prev, includeCropMarks: e.target.checked }))}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <Crop className="w-4 h-4 text-emerald-600" />
              Draw Vector Crop Marks (Cut Marks for Stack Cutter)
            </label>

            <div className="p-2.5 bg-muted/60 rounded-md text-[11px] text-muted-foreground flex justify-between">
              <span>Bleed Extension: <strong>3.0 mm (0.125")</strong></span>
              <span>Double-Cut Gutter: <strong>6.0 mm (0.25")</strong></span>
            </div>
          </div>
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

      {/* Security, Fine Print & Shred Policy */}
      <div className="bg-card p-5 rounded-xl border border-border space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          Fine Print Validity & Shred Policy
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Bill Fine Print Validity Standard
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setConfig((prev) => ({ ...prev, validityMode: "forever" }))}
                className={`py-2 px-3 rounded-lg border text-left font-bold transition-all flex items-center gap-2 ${
                  config.validityMode === "forever"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                <span className="text-base font-serif font-black">∞</span>
                <span>Valid Forever (No Exp.)</span>
              </button>

              <button
                onClick={() => setConfig((prev) => ({ ...prev, validityMode: "expires" }))}
                className={`py-2 px-3 rounded-lg border text-left font-bold transition-all flex items-center gap-2 ${
                  config.validityMode === "expires"
                    ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                    : "border-input bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>Set Shred Date</span>
              </button>
            </div>
          </div>

          {config.validityMode === "expires" && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl space-y-1.5 text-xs">
              <label className="block font-bold text-red-700 dark:text-red-300">
                Must Be Destroyed By Shred Dept On:
              </label>
              <input
                type="date"
                value={config.expirationDate}
                onChange={(e) => setConfig((prev) => ({ ...prev, expirationDate: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-input rounded-md font-semibold text-xs"
              />
              <span className="text-[10px] text-muted-foreground block">
                Prints on bottom fine print notice: "MUST BE DESTROYED BY DART SHRED DEPT ON: {config.expirationDate}"
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
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
    </div>
  );
};
