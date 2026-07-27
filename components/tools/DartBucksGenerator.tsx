"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, RefreshCw, Upload, Image as ImageIcon, CheckCircle2, ShieldCheck, FileSpreadsheet, Calendar, Trash2, Trophy, Sparkles, DollarSign, Calculator, Eye, Sliders, Crop, Scissors, Save, AlertTriangle, Layers, FlipHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface DartBuckTemplateItem {
  id: string;
  title: string;
  artist_name?: string;
  image_url: string;
  is_winning_design?: boolean;
  created_at: string;
}

interface DenominationStyle {
  value: string;
  label: string;
  bg: string;
  border: string;
  accent: string;
  circleBg: string;
}

const DENOMINATIONS: Record<string, DenominationStyle> = {
  "1": { value: "1", label: "$1 Bill", bg: "#fef9c3", border: "#db2777", accent: "#db2777", circleBg: "#fffdf0" },
  "5": { value: "5", label: "$5 Bill", bg: "#fbcfe8", border: "#be185d", accent: "#be185d", circleBg: "#fff0f3" },
  "10": { value: "10", label: "$10 Bill", bg: "#fef08a", border: "#b45309", accent: "#b45309", circleBg: "#fffde8" },
  "20": { value: "20", label: "$20 Bill", bg: "#bbf7d0", border: "#15803d", accent: "#15803d", circleBg: "#f0fdf4" },
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface DartBuckConfig {
  mode: "single" | "drawer";
  drawerAmount: number;
  drawerWeighting: "balanced" | "heavy" | "light" | "custom";
  drawerBreakdown: { bill20: number; bill10: number; bill5: number; bill1: number };
  stationPrefix: string;
  batchId: string;
  startSerial: number;
  cardCount: number;
  digits: number;
  includeChecksum: boolean;
  theme: "monopoly" | "custom" | "classic_gold" | "clean_teal" | "vintage_navy";
  denomination: string;
  selectedMonth: string;
  watermarkMode: "auto" | "dark" | "light" | "none";
  activeTemplateId: string | null;
  customBgUrl: string | null;
  showPresetBorders: boolean;
  showPresetText: boolean;
  showWatermark: boolean;
  includeDuplexBacks: boolean;
  previewView: "card" | "sheet-front" | "sheet-back";
  serialPosition: "bottom" | "top" | "bottom-right";
  title: string;
  subtitle: string;
  textColor: string;
}

export default function DartBucksGenerator() {
  const [config, setConfig] = useState<DartBuckConfig>({
    mode: "drawer",
    drawerAmount: 200,
    drawerWeighting: "balanced",
    drawerBreakdown: { bill20: 7, bill10: 4, bill5: 3, bill1: 5 },
    stationPrefix: "COACH",
    batchId: Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase(),
    startSerial: 1,
    cardCount: 14,
    digits: 4,
    includeChecksum: true,
    theme: "monopoly",
    denomination: "20",
    selectedMonth: "January",
    watermarkMode: "auto",
    activeTemplateId: null,
    customBgUrl: null,
    showPresetBorders: true,
    showPresetText: true,
    showWatermark: true,
    includeDuplexBacks: true,
    previewView: "card",
    serialPosition: "bottom",
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

  // Crop Editor State
  const [croppingItem, setCroppingItem] = useState<DartBuckTemplateItem | null>(null);
  const [cropZoom, setCropZoom] = useState(1.0);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [cropFitMode, setCropFitMode] = useState<"cover" | "contain" | "stretch">("cover");

  const [watermarkLightImg, setWatermarkLightImg] = useState<HTMLImageElement | null>(null);
  const [watermarkDarkImg, setWatermarkDarkImg] = useState<HTMLImageElement | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const imgL = new Image();
    imgL.src = "/images/watermarks/watermark-light.svg";
    imgL.onload = () => setWatermarkLightImg(imgL);

    const imgD = new Image();
    imgD.src = "/images/watermarks/watermark-dark.svg";
    imgD.onload = () => setWatermarkDarkImg(imgD);

    fetchTemplates();
  }, []);

  // Calculate bill breakdown based on weighting preference
  const computeBreakdown = (amount: number, weighting: "balanced" | "heavy" | "light") => {
    let remaining = Math.max(0, amount);
    let b20 = 0;
    let b10 = 0;
    let b5 = 0;
    let b1 = 0;

    if (weighting === "heavy") {
      // Maximize $20s
      b20 = Math.floor(remaining / 20);
      remaining %= 20;
      b10 = Math.floor(remaining / 10);
      remaining %= 10;
      b5 = Math.floor(remaining / 5);
      remaining %= 5;
      b1 = remaining;
    } else if (weighting === "light") {
      // Provide more $1s & $5s
      b1 = Math.min(20, remaining);
      remaining -= b1;

      b5 = Math.min(10, Math.floor(remaining / 5));
      remaining -= b5 * 5;

      b10 = Math.min(5, Math.floor(remaining / 10));
      remaining -= b10 * 10;

      b20 = Math.floor(remaining / 20);
      remaining %= 20;
      b1 += remaining;
    } else {
      // Balanced standard drawer ($200 default -> 7 x $20 = 140, 4 x $10 = 40, 3 x $5 = 15, 5 x $1 = 5)
      b20 = Math.floor((remaining * 0.7) / 20);
      remaining -= b20 * 20;

      b10 = Math.floor((remaining * 0.6) / 10);
      remaining -= b10 * 10;

      b5 = Math.floor(remaining / 5);
      remaining -= b5 * 5;

      b1 = remaining;
    }

    return { bill20: b20, bill10: b10, bill5: b5, bill1: b1 };
  };

  const handleDrawerAmountChange = (amount: number) => {
    const validAmount = Math.max(0, amount);
    const breakdown = computeBreakdown(validAmount, config.drawerWeighting === "custom" ? "balanced" : config.drawerWeighting);
    setConfig((prev) => ({
      ...prev,
      drawerAmount: validAmount,
      drawerBreakdown: breakdown,
    }));
  };

  const handleWeightingChange = (weighting: "balanced" | "heavy" | "light") => {
    const breakdown = computeBreakdown(config.drawerAmount, weighting);
    setConfig((prev) => ({
      ...prev,
      drawerWeighting: weighting,
      drawerBreakdown: breakdown,
    }));
  };

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

      setConfig((prev) => ({
        ...prev,
        theme: "custom",
        customBgUrl: dataUrl,
        activeTemplateId: newItem.id,
      }));

      setCroppingItem(newItem);
      setCropZoom(1.0);
      setCropOffsetX(0);
      setCropOffsetY(0);

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

  const isLightBg = (hexColor: string): boolean => {
    let hex = hexColor.replace("#", "");
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    const r = parseInt(hex.substring(0, 2), 16) || 240;
    const g = parseInt(hex.substring(2, 4), 16) || 240;
    const b = parseInt(hex.substring(4, 6), 16) || 240;

    const luminance = (r * 299 + g * 587 + b * 114) / 1000;
    return luminance > 140;
  };

  const getContrastWatermark = (bgColorHex: string): HTMLImageElement | null => {
    if (config.watermarkMode === "none" || !config.showWatermark) return null;
    if (config.watermarkMode === "light") return watermarkLightImg;
    if (config.watermarkMode === "dark") return watermarkDarkImg;
    return isLightBg(bgColorHex) ? watermarkDarkImg : watermarkLightImg;
  };

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

  // Render DartBuck FRONT side
  const renderDartBuckOnCanvas = (
    canvas: HTMLCanvasElement,
    serialNum: number,
    denomValue = config.denomination,
    width = 1200,
    height = 469
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const style = DENOMINATIONS[denomValue] || DENOMINATIONS["1"];

    if (config.theme === "custom" && config.customBgUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = config.customBgUrl;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);

        const wm = getContrastWatermark("#ffffff");
        if (wm) {
          ctx.save();
          ctx.globalAlpha = 0.2;
          ctx.drawImage(wm, width / 2 - 250, height / 2 - 250, 500, 500);
          ctx.restore();
        }

        if (config.showPresetBorders) {
          ctx.strokeStyle = "rgba(0,0,0,0.4)";
          ctx.lineWidth = 6;
          ctx.strokeRect(12, 12, width - 24, height - 24);
        }

        drawTextOverlay(ctx, serialNum, width, height);
      };
      return;
    }

    if (config.theme === "monopoly") {
      ctx.fillStyle = style.bg;
      ctx.fillRect(0, 0, width, height);

      const wm = getContrastWatermark(style.bg);
      if (wm) {
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.drawImage(wm, width / 2 - 260, height / 2 - 260, 520, 520);
        ctx.restore();
      }

      if (config.showPresetBorders) {
        const margin = 16;
        ctx.strokeStyle = style.border;
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
          ctx.fillStyle = style.circleBg;
          ctx.beginPath();
          ctx.arc(c.cx, c.cy, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = style.border;
          ctx.lineWidth = 3;
          ctx.stroke();

          if (c.type === "logo") {
            drawDartLogoInCircle(ctx, c.cx, c.cy, "#000000");
          } else {
            ctx.fillStyle = "#000000";
            ctx.font = "bold 60px serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(denomValue, c.cx, c.cy);
          }
        });

        ctx.fillStyle = style.accent;
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

        ctx.fillStyle = style.circleBg;
        ctx.beginPath();
        ctx.ellipse(ovalCx, ovalCy, ovalRx, ovalRy, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = style.border;
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
        ctx.font = "bold 120px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(denomValue, ovalCx, ovalCy + 25);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 5;
        ctx.strokeText(denomValue, ovalCx, ovalCy + 25);

        ctx.fillStyle = style.accent;
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`$${denomValue} DENOMINATION`, ovalCx, ovalCy + 105);
      }
    }

    drawTextOverlay(ctx, serialNum, width, height);
  };

  // Render DartBuck BACK side (for double-sided duplex printing)
  const renderDartBuckBackOnCanvas = (
    canvas: HTMLCanvasElement,
    serialNum: number,
    denomValue = config.denomination,
    width = 1200,
    height = 469
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const style = DENOMINATIONS[denomValue] || DENOMINATIONS["1"];

    ctx.fillStyle = style.circleBg;
    ctx.fillRect(0, 0, width, height);

    // Decorative guilloche border
    ctx.strokeStyle = style.border;
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    ctx.strokeStyle = style.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, width - 56, height - 56);

    // Central DART Board / Logo Emblem
    const wm = getContrastWatermark(style.circleBg);
    if (wm) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.drawImage(wm, width / 2 - 200, height / 2 - 200, 400, 400);
      ctx.restore();
    }

    // Large Back Denomination
    ctx.fillStyle = style.border;
    ctx.font = "bold 110px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`$${denomValue}`, width / 2, height / 2 - 15);

    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText("DESERT AREA RESOURCES & TRAINING • EST. 1962", width / 2, height / 2 + 75);

    // Back Serial Number (Bottom Right)
    const serialStr = getSerialString(serialNum);
    ctx.font = "bold 20px monospace";
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "right";
    ctx.fillText(serialStr, width - 45, height - 40);
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

    ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
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

  // Render Full A4 Sheet Preview (Front or Back Duplex Mirrored Grid)
  const renderA4SheetPreview = (canvas: HTMLCanvasElement, isBack: boolean) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // A4 300DPI Preview ratio: 1240 x 1754
    canvas.width = 1240;
    canvas.height = 1754;

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    const cols = 2;
    const rows = 7;
    const cardW = 550;
    const cardH = 215;
    const gapX = 24;
    const gapY = 20;

    const marginX = (canvas.width - (cols * cardW + (cols - 1) * gapX)) / 2;
    const marginY = (canvas.height - (rows * cardH + (rows - 1) * gapY)) / 2;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 1200;
    tempCanvas.height = 469;

    let serialIdx = config.startSerial;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Double-Sided Duplex Mirroring Math:
        // On Back Side (isBack = true), column 0 (left) mirrors to column 1 (right)!
        const colToDraw = isBack ? cols - 1 - c : c;
        const x = marginX + colToDraw * (cardW + gapX);
        const y = marginY + r * (cardH + gapY);

        if (isBack) {
          renderDartBuckBackOnCanvas(tempCanvas, serialIdx, config.denomination, 1200, 469);
        } else {
          renderDartBuckOnCanvas(tempCanvas, serialIdx, config.denomination, 1200, 469);
        }

        ctx.drawImage(tempCanvas, x, y, cardW, cardH);
        serialIdx++;
      }
    }

    // Header Tag
    ctx.fillStyle = isBack ? "#1e1b4b" : "#064e3b";
    ctx.fillRect(marginX, 30, cols * cardW + (cols - 1) * gapX, 40);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      isBack
        ? "PRINTABLE A4 SHEET - BACK SIDE (DUPLEX MIRRORED FOR PERFECT ALIGNMENT)"
        : "PRINTABLE A4 SHEET - FRONT SIDE (2×7 GRID)",
      canvas.width / 2,
      56
    );
  };

  useEffect(() => {
    if (config.previewView === "card" && previewCanvasRef.current) {
      renderDartBuckOnCanvas(previewCanvasRef.current, activeSerialPreview);
    } else if (config.previewView === "sheet-front" && sheetCanvasRef.current) {
      renderA4SheetPreview(sheetCanvasRef.current, false);
    } else if (config.previewView === "sheet-back" && sheetCanvasRef.current) {
      renderA4SheetPreview(sheetCanvasRef.current, true);
    }
  }, [config, activeSerialPreview]);

  const drawDrawerAuditSlip = (canvas: HTMLCanvasElement, totalValue: number, breakdown: { bill20: number; bill10: number; bill5: number; bill1: number }) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 1697;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("DART COMMERCIAL SERVICES", canvas.width / 2, 130);

    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "#2563eb";
    ctx.fillText("CASH DRAWER AUDIT SLIP & BATCH ALLOTMENT", canvas.width / 2, 190);

    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 230);
    ctx.lineTo(canvas.width - 80, 230);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "#334155";

    const dateStr = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    ctx.fillText(`DATE & TIME: ${dateStr}`, 100, 300);
    ctx.fillText(`BATCH AUDIT ID: ${config.batchId}`, 100, 350);
    ctx.fillText(`ISSUING STATION: ${config.stationPrefix}`, 100, 400);

    ctx.fillStyle = "#047857";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(`TARGET DRAWER TOTAL: $${totalValue.toFixed(2)}`, 100, 480);

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(100, 540, canvas.width - 200, 60);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("DENOMINATION", 130, 580);
    ctx.fillText("BILL COUNT", 500, 580);
    ctx.fillText("SUBTOTAL VALUE", 850, 580);

    const rows = [
      { name: "$20 Bills", count: breakdown.bill20, value: breakdown.bill20 * 20 },
      { name: "$10 Bills", count: breakdown.bill10, value: breakdown.bill10 * 10 },
      { name: "$5 Bills", count: breakdown.bill5, value: breakdown.bill5 * 5 },
      { name: "$1 Bills", count: breakdown.bill1, value: breakdown.bill1 * 1 },
    ];

    let currentY = 640;
    rows.forEach((r, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
      ctx.fillRect(100, currentY - 40, canvas.width - 200, 60);

      ctx.strokeStyle = "#e2e8f0";
      ctx.strokeRect(100, currentY - 40, canvas.width - 200, 60);

      ctx.fillStyle = "#0f172a";
      ctx.font = "600 24px sans-serif";
      ctx.fillText(r.name, 130, currentY);
      ctx.fillText(`${r.count} Bills`, 500, currentY);
      ctx.fillText(`$${r.value.toFixed(2)}`, 850, currentY);

      currentY += 60;
    });

    const totalBills = breakdown.bill20 + breakdown.bill10 + breakdown.bill5 + breakdown.bill1;

    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(100, currentY - 30, canvas.width - 200, 70);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("TOTAL ALLOTMENT", 130, currentY + 15);
    ctx.fillText(`${totalBills} Bills Total`, 500, currentY + 15);
    ctx.fillText(`$${totalValue.toFixed(2)}`, 850, currentY + 15);

    const sigY = currentY + 220;
    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = "#475569";

    ctx.fillText("COACH / MANAGER SIGNATURE:", 100, sigY);
    ctx.beginPath();
    ctx.moveTo(440, sigY);
    ctx.lineTo(700, sigY);
    ctx.stroke();

    ctx.fillText("CASHIER / RECIPIENT SIGNATURE:", 100, sigY + 100);
    ctx.beginPath();
    ctx.moveTo(460, sigY + 100);
    ctx.lineTo(700, sigY + 100);
    ctx.stroke();

    ctx.fillText("DATE:", 760, sigY);
    ctx.beginPath();
    ctx.moveTo(830, sigY);
    ctx.lineTo(1050, sigY);
    ctx.stroke();
  };

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

      // PAGE 1: Cash Drawer Audit Slip (If in Drawer mode)
      if (config.mode === "drawer") {
        const auditCanvas = document.createElement("canvas");
        drawDrawerAuditSlip(auditCanvas, config.drawerAmount, config.drawerBreakdown);
        const auditImg = auditCanvas.toDataURL("image/png");
        doc.addImage(auditImg, "PNG", 0, 0, 210, 297);
        doc.addPage();
      }

      const billQueue: { denom: string; serial: number }[] = [];
      let currentSerial = config.startSerial;

      if (config.mode === "drawer") {
        for (let i = 0; i < config.drawerBreakdown.bill20; i++) {
          billQueue.push({ denom: "20", serial: currentSerial++ });
        }
        for (let i = 0; i < config.drawerBreakdown.bill10; i++) {
          billQueue.push({ denom: "10", serial: currentSerial++ });
        }
        for (let i = 0; i < config.drawerBreakdown.bill5; i++) {
          billQueue.push({ denom: "5", serial: currentSerial++ });
        }
        for (let i = 0; i < config.drawerBreakdown.bill1; i++) {
          billQueue.push({ denom: "1", serial: currentSerial++ });
        }
      } else {
        for (let i = 0; i < config.cardCount; i++) {
          billQueue.push({ denom: config.denomination, serial: currentSerial++ });
        }
      }

      const frontCanvas = document.createElement("canvas");
      frontCanvas.width = 1200;
      frontCanvas.height = 469;

      const backCanvas = document.createElement("canvas");
      backCanvas.width = 1200;
      backCanvas.height = 469;

      const totalPages = Math.ceil(billQueue.length / (cols * rows));

      for (let p = 0; p < totalPages; p++) {
        if (p > 0 || config.mode === "drawer") {
          doc.addPage();
        }

        // FRONT PAGE
        for (let i = 0; i < cols * rows; i++) {
          const queueIndex = p * (cols * rows) + i;
          if (queueIndex >= billQueue.length) break;

          const item = billQueue[queueIndex];
          renderDartBuckOnCanvas(frontCanvas, item.serial, item.denom, 1200, 469);
          const imgData = frontCanvas.toDataURL("image/png");

          const col = i % cols;
          const row = Math.floor(i / cols);

          const x = marginX + col * (cardWidthMm + gapX);
          const y = marginY + row * (cardHeightMm + gapY);

          doc.addImage(imgData, "PNG", x, y, cardWidthMm, cardHeightMm);
        }

        // DUPLEX BACK PAGE (IF ENABLED)
        if (config.includeDuplexBacks) {
          doc.addPage();
          for (let i = 0; i < cols * rows; i++) {
            const queueIndex = p * (cols * rows) + i;
            if (queueIndex >= billQueue.length) break;

            const item = billQueue[queueIndex];
            renderDartBuckBackOnCanvas(backCanvas, item.serial, item.denom, 1200, 469);
            const imgDataBack = backCanvas.toDataURL("image/png");

            const col = i % cols;
            const row = Math.floor(i / cols);

            // MIRRORED DUPLEX COLUMN ALIGNMENT MATH:
            const mirroredCol = cols - 1 - col;

            const x = marginX + mirroredCol * (cardWidthMm + gapX);
            const y = marginY + row * (cardHeightMm + gapY);

            doc.addImage(imgDataBack, "PNG", x, y, cardWidthMm, cardHeightMm);
          }
        }
      }

      const filename = config.mode === "drawer"
        ? `DartBucks_Drawer_Allotment_$${config.drawerAmount}_${config.batchId}.pdf`
        : `DartBucks_${config.denomination}s_Batch_${config.batchId}.pdf`;

      doc.save(filename);
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
            DartBucks Cash Drawer & Monopoly Allotment Tool
          </h1>
          <p className="text-muted-foreground mt-1">
            Print $200/$250 cash drawers with duplex mirrored backs, audit slips & contrast watermarks.
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
          {isGenerating ? "Generating Allotment PDF..." : "Export Allotment PDF"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Controls */}
        <div className="lg:col-span-5 space-y-6">
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
                      onChange={(e) => handleDrawerAmountChange(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 text-base font-bold bg-background border border-input rounded-md"
                    />
                  </div>
                  <button
                    onClick={() => handleDrawerAmountChange(200)}
                    className="px-3 py-2 text-xs font-bold bg-secondary text-secondary-foreground rounded-md border border-input"
                  >
                    $200 Preset
                  </button>
                  <button
                    onClick={() => handleDrawerAmountChange(250)}
                    className="px-3 py-2 text-xs font-bold bg-secondary text-secondary-foreground rounded-md border border-input"
                  >
                    $250 Preset
                  </button>
                </div>
              </div>

              {/* Weighting Preference */}
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
                      onClick={() => handleWeightingChange(w.id as any)}
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

          {/* Monopoly Denominations */}
          <div className="bg-card p-5 rounded-xl border border-border space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <DollarSign className="w-5 h-5 text-amber-500" />
              Monopoly Denomination Styles
            </h2>

            <div className="grid grid-cols-4 gap-2">
              {Object.values(DENOMINATIONS).map((d) => {
                const isSelected = config.denomination === d.value;
                return (
                  <button
                    key={d.value}
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        denomination: d.value,
                        theme: "monopoly",
                      }))
                    }
                    className={`py-3 px-2 text-xs font-bold rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? "ring-2 ring-primary border-primary shadow-sm"
                        : "border-input bg-background hover:bg-muted"
                    }`}
                    style={{
                      backgroundColor: isSelected ? d.bg : undefined,
                      borderColor: isSelected ? d.border : undefined,
                      color: isSelected ? d.border : undefined,
                    }}
                  >
                    <span className="text-base font-extrabold">${d.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duplex Back & Watermark Controls */}
          <div className="bg-card p-5 rounded-xl border border-border space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <FlipHorizontal className="w-5 h-5 text-indigo-500" />
              Duplex Printing & Watermark Settings
            </h2>

            <div className="space-y-3">
              <label className="text-xs font-bold text-foreground flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeDuplexBacks}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      includeDuplexBacks: e.target.checked,
                    }))
                  }
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                Include Double-Sided Back Pages (Mirrored Duplex Grid)
              </label>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  SVG Watermark Contrast Mode
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: "auto", label: "Auto Contrast" },
                    { id: "dark", label: "Dark SVG" },
                    { id: "light", label: "Light SVG" },
                    { id: "none", label: "Off" },
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setConfig((prev) => ({ ...prev, watermarkMode: w.id as any }))}
                      className={`py-2 px-1 text-[11px] font-semibold rounded border transition-all ${
                        config.watermarkMode === w.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Live Card & Printable Sheet Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Live Print & Grid Preview
              </h2>

              {/* Preview View Selector Tabs */}
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

            {/* Canvas Container */}
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
                {config.previewView === "sheet-back"
                  ? "Duplex Mirrored Back Alignment (Col 0 ↔ Col 1 Swap):"
                  : "Active Batch Serial Identifier:"}
              </span>
              <span className="font-mono font-bold text-primary">
                {getSerialString(config.startSerial)}
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
      </div>
    </div>
  );
}
