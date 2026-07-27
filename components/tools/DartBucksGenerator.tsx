"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, RefreshCw, Upload, Image as ImageIcon, CheckCircle2, ShieldCheck, FileSpreadsheet, Calendar, Trash2, Trophy, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface DartBuckTemplateItem {
  id: string;
  title: string;
  artist_name?: string;
  image_url: string;
  is_winning_design?: boolean;
  created_at: string;
}

interface DartBuckConfig {
  stationPrefix: string;
  batchId: string;
  startSerial: number;
  cardCount: number;
  digits: number;
  includeChecksum: boolean;
  theme: "monopoly" | "custom" | "classic_gold" | "clean_teal" | "vintage_navy";
  selectedMonth: string;
  activeTemplateId: string | null;
  customBgUrl: string | null;
  showPresetBorders: boolean;
  showPresetText: boolean;
  serialPosition: "bottom" | "top" | "bottom-right";
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
    activeTemplateId: null,
    customBgUrl: null,
    showPresetBorders: true,
    showPresetText: true,
    serialPosition: "bottom",
    denomination: "1",
    title: "DART BUCKS",
    subtitle: "COMMERCIAL SERVICES INCENTIVE",
    textColor: "#1a4d2e",
  });

  const [templates, setTemplates] = useState<DartBuckTemplateItem[]>([]);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadArtist, setUploadArtist] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSerialPreview, setActiveSerialPreview] = useState(1);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved templates from Supabase or localStorage
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("dartbuck_templates")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setTemplates(data);
          return;
        }
      }
    } catch (e) {
      console.warn("Supabase fetch fallback to local storage");
    }

    // LocalStorage Fallback
    const local = localStorage.getItem("dartbuck_templates");
    if (local) {
      try {
        setTemplates(JSON.parse(local));
      } catch (err) {
        console.error("Failed to parse local templates", err);
      }
    }
  };

  const saveTemplateItem = async (newItem: DartBuckTemplateItem) => {
    const updated = [newItem, ...templates];
    setTemplates(updated);
    localStorage.setItem("dartbuck_templates", JSON.stringify(updated));

    try {
      if (supabase) {
        await supabase.from("dartbuck_templates").insert([{
          id: newItem.id,
          title: newItem.title,
          artist_name: newItem.artist_name,
          image_url: newItem.image_url,
          is_winning_design: newItem.is_winning_design,
          created_at: newItem.created_at
        }]);
      }
    } catch (e) {
      console.warn("Supabase insert fallback");
    }
  };

  const deleteTemplateItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    localStorage.setItem("dartbuck_templates", JSON.stringify(updated));

    if (config.activeTemplateId === id) {
      setConfig((prev) => ({
        ...prev,
        theme: "monopoly",
        customBgUrl: null,
        activeTemplateId: null,
      }));
    }

    try {
      if (supabase) {
        await supabase.from("dartbuck_templates").delete().eq("id", id);
      }
    } catch (e) {
      console.warn("Supabase delete fallback");
    }
  };

  // Generate 2-character verification checksum
  const calculateChecksum = (batchStr: string, serialNum: number): string => {
    let sum = 0;
    const combined = `${batchStr}${serialNum}`;
    for (let i = 0; i < combined.length; i++) {
      sum = (sum * 31 + combined.charCodeAt(i)) % 256;
    }
    return sum.toString(16).padStart(2, "0").toUpperCase();
  };

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

  // Handle direct file upload / client drawing submission
  const handleFileUpload = (file: File) => {
    if (!file) return;
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const title = uploadTitle.trim() || `Client Buck ${templates.length + 1}`;
      const artist = uploadArtist.trim() || "Client Submission";

      const newItem: DartBuckTemplateItem = {
        id: "tpl_" + Math.random().toString(36).substring(2, 9),
        title,
        artist_name: artist,
        image_url: dataUrl,
        is_winning_design: true,
        created_at: new Date().toISOString(),
      };

      await saveTemplateItem(newItem);

      // Instantly set as active custom template
      setConfig((prev) => ({
        ...prev,
        theme: "custom",
        customBgUrl: dataUrl,
        activeTemplateId: newItem.id,
      }));

      setUploadTitle("");
      setUploadArtist("");
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
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

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 32, cy - 20);
    ctx.lineTo(cx + 32, cy - 20);
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("DART", cx, cy - 2);

    ctx.font = "bold 5px sans-serif";
    ctx.fillText("DESERT AREA RESOURCES & TRAINING", cx, cy + 8);

    ctx.beginPath();
    ctx.moveTo(cx - 32, cy + 13);
    ctx.lineTo(cx + 12, cy + 13);
    ctx.stroke();

    ctx.font = "italic 7px cursive, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Established Since 1962", cx + 32, cy + 22);

    ctx.restore();
  };

  // Draw curved text along arc
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

  // Render DartBuck on Canvas
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

    ctx.clearRect(0, 0, width, height);

    // Custom Background (Uploaded Client Design)
    if (config.theme === "custom" && config.customBgUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = config.customBgUrl;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);

        if (config.showPresetBorders) {
          ctx.strokeStyle = "rgba(0,0,0,0.4)";
          ctx.lineWidth = 6;
          ctx.strokeRect(12, 12, width - 24, height - 24);
        }

        drawTextOverlay(ctx, serialNum, width, height);
      };
      return;
    }

    // Monopoly Style Theme
    if (config.theme === "monopoly") {
      const palette = MONTH_PALETTES[config.selectedMonth] || MONTH_PALETTES["January"];

      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, width, height);

      if (config.showPresetBorders) {
        const margin = 16;
        ctx.strokeStyle = palette.border;
        ctx.lineWidth = 4;
        ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

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

        ctx.fillStyle = palette.accent;
        ctx.font = "bold 96px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", 220, height / 2 - 10);
        ctx.fillText("$", width - 220, height / 2 - 10);
      }

      if (config.showPresetText) {
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

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 130px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(config.denomination, ovalCx, ovalCy + 25);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 5;
        ctx.strokeText(config.denomination, ovalCx, ovalCy + 25);

        ctx.fillStyle = palette.accent;
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(config.selectedMonth.toUpperCase(), ovalCx, ovalCy + 105);
      }
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

    let boxX = width / 2 - 280;
    let boxY = height - 60;

    if (config.serialPosition === "top") {
      boxY = 15;
    } else if (config.serialPosition === "bottom-right") {
      boxX = width - 580;
      boxY = height - 60;
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.fillRect(boxX, boxY, 560, 45);

    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, 560, 45);

    ctx.fillStyle = "#b91c1c";
    ctx.font = "bold 28px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(serialStr, boxX + 280, boxY + 23);
  };

  useEffect(() => {
    if (previewCanvasRef.current) {
      renderDartBuckOnCanvas(previewCanvasRef.current, activeSerialPreview);
    }
  }, [config, activeSerialPreview]);

  const downloadPDF = async () => {
    setIsGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");

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

      doc.save(`DartBucks_Batch_${config.batchId}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to export PDF.");
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
            <Trophy className="w-8 h-8 text-amber-500" />
            Client Contest & DartBucks Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload client drawings directly to the database, select winning artworks, and print audit-numbered bills.
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
        {/* Left Column - Controls & Upload Gallery */}
        <div className="lg:col-span-5 space-y-6">
          {/* Direct Upload & Contest Submission */}
          <div className="bg-card p-5 rounded-xl border border-border space-y-4 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Upload className="w-5 h-5 text-blue-500" />
              Upload Client Drawing to Database
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Title / Artwork Name
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Sarah's Winning Buck"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Artist / Client Name
                </label>
                <input
                  type="text"
                  value={uploadArtist}
                  onChange={(e) => setUploadArtist(e.target.value)}
                  placeholder="e.g. Sarah M."
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
                />
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-3 px-4 text-xs font-bold rounded-lg border-2 border-dashed border-primary bg-primary/5 hover:bg-primary/10 text-primary flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                {isUploading ? "Uploading to DB..." : "Select & Upload Client Art File"}
              </button>
            </div>
          </div>

          {/* Client Submissions Gallery */}
          <div className="bg-card p-5 rounded-xl border border-border space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Saved Client Bucks Gallery ({templates.length})
              </h2>
            </div>

            {templates.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-3 text-center">
                No custom client artwork uploaded yet. Upload one above to select it!
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {templates.map((tpl) => {
                  const isSelected =
                    config.theme === "custom" && config.activeTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          theme: "custom",
                          customBgUrl: tpl.image_url,
                          activeTemplateId: tpl.id,
                        }))
                      }
                      className={`relative p-2 rounded-lg border cursor-pointer group transition-all ${
                        isSelected
                          ? "ring-2 ring-primary border-primary bg-primary/10"
                          : "border-input bg-background hover:bg-muted"
                      }`}
                    >
                      <img
                        src={tpl.image_url}
                        alt={tpl.title}
                        className="w-full h-20 object-cover rounded border border-border"
                      />
                      <div className="mt-1.5 flex items-center justify-between">
                        <div className="truncate pr-1">
                          <p className="text-xs font-bold text-foreground truncate">
                            {tpl.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            By {tpl.artist_name || "Client"}
                          </p>
                        </div>
                        <button
                          onClick={(e) => deleteTemplateItem(tpl.id, e)}
                          title="Remove Artwork"
                          className="p-1 text-muted-foreground hover:text-red-500 rounded opacity-80 hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Preset Monthly Color Palettes */}
          <div className="bg-card p-5 rounded-xl border border-border space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Calendar className="w-5 h-5 text-pink-500" />
              Monopoly Style - Monthly Palettes
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
                        activeTemplateId: null,
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

          {/* Security & Serial Settings */}
          <div className="bg-card p-5 rounded-xl border border-border space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Security & Overlay Controls
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
                    onClick={regenerateBatchId}
                    className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Removable Overlays & Position */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showPresetBorders}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      showPresetBorders: e.target.checked,
                    }))
                  }
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                Show Preset Border & Corner Emblems
              </label>

              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showPresetText}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      showPresetText: e.target.checked,
                    }))
                  }
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                Show Center Oval & "DART BUCKS" Text
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Live Card & Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Live Card Preview
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                1200 × 469 px
              </span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-border bg-slate-950 p-3 flex items-center justify-center">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full h-auto rounded shadow-lg border border-slate-800"
              />
            </div>

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

            <div className="p-3 bg-muted/60 rounded-lg border border-border flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Generated Security Identifier:
              </span>
              <span className="text-xs font-mono font-bold text-primary">
                {getSerialString(config.startSerial + activeSerialPreview - 1)}
              </span>
            </div>
          </div>

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
