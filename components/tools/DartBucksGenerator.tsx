"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, RefreshCw, Upload, Image as ImageIcon, CheckCircle2, ShieldCheck, FileSpreadsheet, Calendar } from "lucide-react";

interface DartBuckConfig {
  stationPrefix: string;
  batchId: string;
  startSerial: number;
  cardCount: number;
  digits: number;
  includeChecksum: boolean;
  theme: "monopoly" | "classic_gold" | "clean_teal" | "vintage_navy" | "custom";
  selectedMonth: string;
  customBgUrl: string | null;
  denomination: string;
  title: string;
  subtitle: string;
  textColor: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_PALETTES: Record<string, { bg: string; border: string; accent: string; circleBg: string }> = {
  January: { bg: "#fce3b5", border: "#ff007f", accent: "#ff007f", circleBg: "#fff8eb" },
  February: { bg: "#ffccd5", border: "#c9184a", accent: "#c9184a", circleBg: "#fff0f3" },
  March: { bg: "#d8f3dc", border: "#1b4332", accent: "#1b4332", circleBg: "#f7fff7" },
  April: { bg: "#fff3b0", border: "#e07a5f", accent: "#e07a5f", circleBg: "#fffdf0" },
  May: { bg: "#ffe5ec", border: "#fb6f92", accent: "#fb6f92", circleBg: "#ffffff" },
  June: { bg: "#e2afff", border: "#3a0ca3", accent: "#3a0ca3", circleBg: "#f8f0ff" },
  July: { bg: "#d8e2dc", border: "#1d3557", accent: "#1d3557", circleBg: "#f1faee" },
  August: { bg: "#cffaff", border: "#006d77", accent: "#006d77", circleBg: "#f0fdfa" },
  September: { bg: "#ffe5d9", border: "#9a031e", accent: "#9a031e", circleBg: "#fff5f0" },
  October: { bg: "#ffedd5", border: "#c2410c", accent: "#c2410c", circleBg: "#fff7ed" },
  November: { bg: "#e0f2fe", border: "#4338ca", accent: "#4338ca", circleBg: "#f0f9ff" },
  December: { bg: "#e6fffa", border: "#047857", accent: "#047857", circleBg: "#f0fdf4" },
};

export default function DartBucksGenerator() {
  const [config, setConfig] = useState<DartBuckConfig>({
    stationPrefix: "COACH",
    batchId: Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase(),
    startSerial: 1,
    cardCount: 14,
    digits: 4,
    includeChecksum: true,
    theme: "monopoly",
    selectedMonth: "January",
    customBgUrl: null,
    denomination: "1",
    title: "DART BUCKS",
    subtitle: "COMMERCIAL SERVICES INCENTIVE",
    textColor: "#1a4d2e",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSerialPreview, setActiveSerialPreview] = useState(1);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate simple 2-character verification checksum for fraud prevention
  const calculateChecksum = (batchStr: string, serialNum: number): string => {
    let sum = 0;
    const combined = `${batchStr}${serialNum}`;
    for (let i = 0; i < combined.length; i++) {
      sum = (sum * 31 + combined.charCodeAt(i)) % 256;
    }
    return sum.toString(16).padStart(2, "0").toUpperCase();
  };

  // Generate full batch serial string
  const getSerialString = (serialNum: number): string => {
    const padded = serialNum.toString().padStart(config.digits, "0");
    const checksumStr = config.includeChecksum
      ? `-${calculateChecksum(config.batchId, serialNum)}`
      : "";
    const prefix = config.stationPrefix.trim()
      ? `${config.stationPrefix.trim()}-`
      : "";
    return `${prefix}${config.batchId}-${padded}${checksumStr}`;
  };

  const regenerateBatchId = () => {
    const newId = Math.floor(0x100000 + Math.random() * 0xefffff)
      .toString(16)
      .toUpperCase();
    setConfig((prev) => ({ ...prev, batchId: newId }));
  };

  // Draw DART logo inside canvas circle
  const drawDartLogoInCircle = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    textColor: string
  ) => {
    ctx.save();
    ctx.textAlign = "center";

    // Top border line
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 32, cy - 20);
    ctx.lineTo(cx + 32, cy - 20);
    ctx.stroke();

    // DART main text
    ctx.fillStyle = textColor;
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("DART", cx, cy - 2);

    // Subtitle
    ctx.font = "bold 5px sans-serif";
    ctx.fillText("DESERT AREA RESOURCES & TRAINING", cx, cy + 8);

    // Bottom border line
    ctx.beginPath();
    ctx.moveTo(cx - 32, cy + 13);
    ctx.lineTo(cx + 12, cy + 13);
    ctx.stroke();

    // Established Since 1962
    ctx.font = "italic 7px cursive, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Established Since 1962", cx + 32, cy + 22);

    ctx.restore();
  };

  // Draw curved text along oval arc
  const drawCurvedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    color: string
  ) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = "bold 40px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const totalAngle = endAngle - startAngle;
    const numChars = text.length;

    for (let i = 0; i < numChars; i++) {
      const charAngle = startAngle + (i / (numChars - 1 || 1)) * totalAngle;
      const x = cx + radius * Math.cos(charAngle);
      const y = cy + radius * Math.sin(charAngle);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(charAngle + Math.PI / 2);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
    ctx.restore();
  };

  // Draw DartBuck onto canvas
  const renderDartBuckOnCanvas = (
    canvas: HTMLCanvasElement,
    serialNum: number,
    width = 1200,
    height = 469
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // If Custom Image uploaded
    if (config.theme === "custom" && config.customBgUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = config.customBgUrl;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        drawTextOverlay(ctx, serialNum, width, height);
      };
      return;
    }

    // MONOPOLY STYLE THEME
    if (config.theme === "monopoly") {
      const palette = MONTH_PALETTES[config.selectedMonth] || MONTH_PALETTES["January"];

      // 1. Background fill
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, width, height);

      // 2. Inner Rect Border
      const margin = 16;
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 4;
      ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

      // 3. Corner Circles (Radius 62px)
      const r = 62;
      const corners = [
        { cx: margin + r, cy: margin + r, type: "logo" },
        { cx: width - margin - r, cy: margin + r, type: "number" },
        { cx: margin + r, cy: height - margin - r, type: "number" },
        { cx: width - margin - r, cy: height - margin - r, type: "logo" },
      ];

      corners.forEach((c) => {
        ctx.fillStyle = palette.circleBg;
        ctx.beginPath();
        ctx.arc(c.cx, c.cy, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = palette.border;
        ctx.lineWidth = 3;
        ctx.stroke();

        if (c.type === "logo") {
          drawDartLogoInCircle(ctx, c.cx, c.cy, "#000000");
        } else {
          ctx.fillStyle = "#000000";
          ctx.font = "bold 64px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(config.denomination, c.cx, c.cy);
        }
      });

      // 4. Side Dollar Signs
      ctx.fillStyle = palette.accent;
      ctx.font = "bold 96px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", 220, height / 2 - 10);
      ctx.fillText("$", width - 220, height / 2 - 10);

      // 5. Central Oval
      const ovalCx = width / 2;
      const ovalCy = height / 2 - 10;
      const ovalRx = 210;
      const ovalRy = 145;

      ctx.fillStyle = palette.circleBg;
      ctx.beginPath();
      ctx.ellipse(ovalCx, ovalCy, ovalRx, ovalRy, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Curved "DART BUCKS"
      drawCurvedText(
        ctx,
        "DART BUCKS",
        ovalCx,
        ovalCy + 25,
        130,
        -Math.PI * 0.78,
        -Math.PI * 0.22,
        "#000000"
      );

      // Central Big Outlined Denomination "1"
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 130px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(config.denomination, ovalCx, ovalCy + 25);

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 5;
      ctx.strokeText(config.denomination, ovalCx, ovalCy + 25);

      // Month Tag
      ctx.fillStyle = palette.accent;
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(config.selectedMonth.toUpperCase(), ovalCx, ovalCy + 105);
    } else if (config.theme === "classic_gold") {
      // Classic Gold Theme
      ctx.fillStyle = "#fcfdf9";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "#1a4d2e";
      ctx.lineWidth = 14;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 4;
      ctx.strokeRect(22, 22, width - 44, height - 44);

      ctx.fillStyle = "#1a4d2e";
      ctx.font = "bold 64px serif";
      ctx.textAlign = "center";
      ctx.fillText(config.title, width / 2, 130);

      ctx.fillStyle = "#4a7c59";
      ctx.font = "600 22px sans-serif";
      ctx.fillText(config.subtitle, width / 2, 175);

      ctx.fillStyle = "#e8f5e9";
      ctx.strokeStyle = "#1a4d2e";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(width / 2, 260, 120, 55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#1a4d2e";
      ctx.font = "bold 56px sans-serif";
      ctx.fillText(config.denomination, width / 2, 280);
    } else if (config.theme === "clean_teal") {
      ctx.fillStyle = "#f0fdfa";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#0d9488";
      ctx.fillRect(0, 0, width, 24);
      ctx.fillRect(0, height - 24, width, 24);

      ctx.strokeStyle = "#14b8a6";
      ctx.lineWidth = 6;
      ctx.strokeRect(16, 36, width - 32, height - 72);

      ctx.fillStyle = "#0f766e";
      ctx.font = "bold 68px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(config.title, width / 2, 140);

      ctx.fillStyle = "#0d9488";
      ctx.font = "500 24px sans-serif";
      ctx.fillText(config.subtitle, width / 2, 185);

      ctx.fillStyle = "#ccfbf1";
      ctx.fillRect(width / 2 - 100, 220, 200, 90);

      ctx.fillStyle = "#0f766e";
      ctx.font = "bold 60px sans-serif";
      ctx.fillText(config.denomination, width / 2, 285);
    } else if (config.theme === "vintage_navy") {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 8;
      ctx.strokeRect(16, 16, width - 32, height - 32);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 66px serif";
      ctx.textAlign = "center";
      ctx.fillText(config.title, width / 2, 135);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 64px serif";
      ctx.fillText(config.denomination, width / 2, 285);
    }

    drawTextOverlay(ctx, serialNum, width, height);
  };

  const drawTextOverlay = (
    ctx: CanvasRenderingContext2D,
    serialNum: number,
    width: number,
    height: number
  ) => {
    const serialStr = getSerialString(serialNum);

    // Bottom Bar background for serial number readability
    ctx.fillStyle = config.theme === "vintage_navy" ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(width / 2 - 280, height - 60, 560, 45);

    ctx.strokeStyle = config.theme === "vintage_navy" ? "#475569" : "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - 280, height - 60, 560, 45);

    // Draw Serial Number
    ctx.fillStyle = config.theme === "vintage_navy" ? "#38bdf8" : "#b91c1c";
    ctx.font = "bold 28px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(serialStr, width / 2, height - 37);
  };

  useEffect(() => {
    if (previewCanvasRef.current) {
      renderDartBuckOnCanvas(previewCanvasRef.current, activeSerialPreview);
    }
  }, [config, activeSerialPreview]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig((prev) => ({
          ...prev,
          theme: "custom",
          customBgUrl: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadPDF = async () => {
    setIsGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");

      // A4 page setup in mm
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const cols = 2;
      const rows = 7;
      const cardWidthMm = 95;
      const cardHeightMm = 37.1;
      const gapX = 4;
      const gapY = 3.5;

      const marginX = (210 - (cols * cardWidthMm + (cols - 1) * gapX)) / 2;
      const marginY = (297 - (rows * cardHeightMm + (rows - 1) * gapY)) / 2;

      // Offscreen canvas for high-res rendering (1200x469)
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 469;

      let pageCount = 0;

      for (let i = 0; i < config.cardCount; i++) {
        const currentSerial = config.startSerial + i;
        const pageIndex = Math.floor(i / (cols * rows));
        const indexOnPage = i % (cols * rows);

        if (pageIndex > pageCount) {
          doc.addPage();
          pageCount = pageIndex;
        }

        renderDartBuckOnCanvas(canvas, currentSerial, 1200, 469);
        const imgData = canvas.toDataURL("image/png");

        const col = indexOnPage % cols;
        const row = Math.floor(indexOnPage / cols);

        const x = marginX + col * (cardWidthMm + gapX);
        const y = marginY + row * (cardHeightMm + gapY);

        doc.addImage(imgData, "PNG", x, y, cardWidthMm, cardHeightMm);
      }

      doc.save(`DartBucks_${config.selectedMonth}_Batch_${config.batchId}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to export PDF. Please check browser permissions.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
            DartBucks Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate Monopoly-style incentive currency with 12 monthly color palettes & audit serials (Est. 1962).
          </p>
        </div>
        <button
          onClick={downloadPDF}
          disabled={isGenerating}
          className="mt-4 md:mt-0 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-md"
        >
          {isGenerating ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {isGenerating ? "Generating PDF..." : "Export A4 PDF"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Controls & Security Settings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Monopoly Month Selector */}
          <div className="bg-card p-5 rounded-xl border border-border space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Calendar className="w-5 h-5 text-pink-500" />
              Monopoly Style - Month Palette
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((m) => {
                const palette = MONTH_PALETTES[m];
                const isSelected = config.theme === "monopoly" && config.selectedMonth === m;
                return (
                  <button
                    key={m}
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        theme: "monopoly",
                        selectedMonth: m,
                      }))
                    }
                    className={`py-2 px-2 text-xs font-semibold rounded-md border flex items-center justify-between transition-all ${
                      isSelected
                        ? "ring-2 ring-primary border-primary shadow-sm"
                        : "border-input bg-background hover:bg-muted"
                    }`}
                    style={{
                      backgroundColor: isSelected ? palette.bg : undefined,
                      borderColor: isSelected ? palette.border : undefined,
                      color: isSelected ? palette.border : undefined,
                    }}
                  >
                    <span>{m.substring(0, 3)}</span>
                    <span
                      className="w-3 h-3 rounded-full border border-black/20"
                      style={{ backgroundColor: palette.border }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security & Serial Batch Settings */}
          <div className="bg-card p-5 rounded-xl border border-border space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Decentralized Batch & Audit Settings
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Issuer / Station Prefix
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
                  placeholder="e.g. COACH"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Batch Hash Identifier
                </label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={config.batchId}
                    readOnly
                    className="w-full px-3 py-2 text-sm font-mono bg-muted text-foreground border border-input rounded-md"
                  />
                  <button
                    onClick={regenerateBatchId}
                    title="Generate new Batch Hash"
                    className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Start Serial No.
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.startSerial}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      startSerial: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Total Quantity (Bucks)
                </label>
                <input
                  type="number"
                  min="1"
                  max="140"
                  value={config.cardCount}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      cardCount: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeChecksum}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      includeChecksum: e.target.checked,
                    }))
                  }
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                Include Anti-Tamper Checksum Hash
              </label>
              <span className="text-xs text-emerald-600 font-medium">
                {config.cardCount} Bucks ({Math.ceil(config.cardCount / 14)} Page{Math.ceil(config.cardCount / 14) > 1 ? "s" : ""})
              </span>
            </div>
          </div>

          {/* Design & Preset Themes */}
          <div className="bg-card p-5 rounded-xl border border-border space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              Alternative Themes & Custom Upload
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "monopoly", name: "Monopoly Style" },
                { id: "classic_gold", name: "Classic Emerald" },
                { id: "clean_teal", name: "Clean Teal" },
                { id: "vintage_navy", name: "Vintage Navy" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      theme: t.id as any,
                    }))
                  }
                  className={`py-2 px-3 text-xs font-medium rounded-md border transition-all ${
                    config.theme === t.id
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-input bg-background hover:bg-muted"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            {/* Custom Image Upload */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Upload Custom Base Image (`base_dartbuck.png`)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-2.5 px-4 text-xs font-medium rounded-md border border-dashed flex items-center justify-center gap-2 transition-all ${
                  config.theme === "custom"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-input bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                <Upload className="w-4 h-4" />
                {config.customBgUrl ? "Change Custom Image" : "Upload Custom Background"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Denomination / Value
                </label>
                <input
                  type="text"
                  value={config.denomination}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      denomination: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Live Card & Printable Layout Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Live Card Preview ({config.selectedMonth} Palette)
              </h2>
              <span className="text-xs text-muted-foreground font-mono">
                Size: 1200 × 469 px
              </span>
            </div>

            {/* Canvas Container */}
            <div className="relative rounded-lg overflow-hidden border border-border bg-slate-950 p-3 flex items-center justify-center">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full h-auto rounded shadow-lg border border-slate-800"
              />
            </div>

            {/* Serial Navigation slider for preview */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Previewing Card #{activeSerialPreview} of {config.cardCount}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={activeSerialPreview <= 1}
                  onClick={() => setActiveSerialPreview((prev) => prev - 1)}
                  className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  disabled={activeSerialPreview >= config.cardCount}
                  onClick={() => setActiveSerialPreview((prev) => prev + 1)}
                  className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Active Identifier Display */}
            <div className="p-3 bg-muted/60 rounded-lg border border-border flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Generated Security Identifier:
              </span>
              <span className="text-xs font-mono font-bold text-primary">
                {getSerialString(config.startSerial + activeSerialPreview - 1)}
              </span>
            </div>
          </div>

          {/* Printable Layout Sheet Spec */}
          <div className="bg-card p-5 rounded-xl border border-border space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              A4 Print Sheet Specifications
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-muted/40 rounded-lg border border-border">
                <span className="block text-xs text-muted-foreground">Grid Layout</span>
                <span className="text-sm font-bold text-foreground">2 × 7 (14 / sheet)</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg border border-border">
                <span className="block text-xs text-muted-foreground">Paper Format</span>
                <span className="text-sm font-bold text-foreground">A4 Portrait</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg border border-border">
                <span className="block text-xs text-muted-foreground">Print DPI</span>
                <span className="text-sm font-bold text-foreground">300 DPI Vector</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
