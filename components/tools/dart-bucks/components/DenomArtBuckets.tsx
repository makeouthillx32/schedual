import React from "react";
import { Layers, Upload, Crop, Trash2 } from "lucide-react";
import { DenomArtSlot, DENOMINATIONS } from "../types";

interface DenomArtBucketsProps {
  denomSlots: Record<string, DenomArtSlot>;
  selectedDenom: string;
  onSelectDenom: (denom: "1" | "5" | "10" | "20") => void;
  onUpload: (denom: "1" | "5" | "10" | "20") => void;
  onEdit: (denom: "1" | "5" | "10" | "20") => void;
  onClear: (denom: "1" | "5" | "10" | "20", e: React.MouseEvent) => void;
}

export const DenomArtBuckets: React.FC<DenomArtBucketsProps> = ({
  denomSlots,
  selectedDenom,
  onSelectDenom,
  onUpload,
  onEdit,
  onClear,
}) => {
  return (
    <div className="mb-8 bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Individual Bill Art Buckets ($20s, $10s, $5s, $1s)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload and crop custom client artwork specifically assigned to each denomination bill!
          </p>
        </div>
        <span className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-600 font-bold rounded-full border border-emerald-500/30">
          Database Synced
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(["20", "10", "5", "1"] as const).map((denom) => {
          const slot = denomSlots[denom];
          const hasArt = Boolean(slot && slot.image_url);
          const isSelected = selectedDenom === denom;

          return (
            <div
              key={denom}
              onClick={() => onSelectDenom(denom)}
              className={`relative p-4 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? "ring-2 ring-primary border-primary bg-primary/5 shadow-md"
                  : "border-input bg-background hover:bg-muted/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-lg font-black px-2.5 py-0.5 rounded-md border"
                    style={{
                      backgroundColor: DENOMINATIONS[denom].bg,
                      borderColor: DENOMINATIONS[denom].border,
                      color: DENOMINATIONS[denom].border,
                    }}
                  >
                    ${denom} Bill Slot
                  </span>
                  {hasArt ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded border border-emerald-500/30">
                      Custom Art Assigned
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded">
                      Default Monopoly
                    </span>
                  )}
                </div>

                {/* Artwork Preview Thumbnail */}
                <div className="relative h-28 rounded-lg overflow-hidden border border-border bg-slate-950 mb-3 flex items-center justify-center">
                  {hasArt ? (
                    <img
                      src={slot.image_url!}
                      alt={`${denom} bill art`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center p-2 text-center"
                      style={{ backgroundColor: DENOMINATIONS[denom].bg }}
                    >
                      <span className="text-3xl font-extrabold" style={{ color: DENOMINATIONS[denom].border }}>
                        ${denom}
                      </span>
                      <span className="text-[10px] font-bold text-slate-700">
                        Monopoly Preset
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Slot Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpload(denom);
                  }}
                  className="flex-1 py-2 px-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Art
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(denom);
                  }}
                  className="py-2 px-2 text-xs font-bold bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 flex items-center justify-center gap-1 border border-input"
                  title="Edit & Crop Art"
                >
                  <Crop className="w-3.5 h-3.5" />
                  Crop
                </button>

                {hasArt && (
                  <button
                    onClick={(e) => onClear(denom, e)}
                    className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Clear Custom Art"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
