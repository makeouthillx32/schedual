"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, RefreshCw, Upload, Image as ImageIcon, CheckCircle2, ShieldCheck, FileSpreadsheet, Calendar, Trash2, Trophy, Sparkles, DollarSign, Calculator, Eye, Sliders, Crop, Scissors, Save, AlertTriangle, Layers, FlipHorizontal, Edit3 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface DenomArtSlot {
  denom: "1" | "5" | "10" | "20";
  title: string;
  artist_name: string;
  image_url: string | null;
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
  theme: "monopoly" | "custom";
  denomination: string;
  watermarkMode: "auto" | "dark" | "light" | "none";
  showPresetBorders: boolean;
  showPresetText: boolean;
  showWatermark: boolean;
  includeDuplexBacks: boolean;
  previewView: "card" | "sheet-front" | "sheet-back";
  serialPosition: "bottom" | "top" | "bottom-right";
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
    watermarkMode: "auto",
    showPresetBorders: true,
    showPresetText: true,
    showWatermark: true,
    includeDuplexBacks: true,
    previewView: "card",
    serialPosition: "bottom",
  });

  // Individual Art Bucket / Slot for Each Bill ($1, $5, $10, $20)
  const [denomSlots, setDenomSlots] = useState<Record<string, DenomArtSlot>>({
    "1": { denom: "1", title: "$1 Bill Artwork", artist_name: "Client Submission", image_url: null },
    "5": { denom: "5", title: "$5 Bill Artwork", artist_name: "Client Submission", image_url: null },
    "10": { denom: "10", title: "$10 Bill Artwork", artist_name: "Client Submission", image_url: null },
    "20": { denom: "20", title: "$20 Bill Artwork", artist_name: "Client Submission", image_url: null },
  });

  const [activeEditingDenom, setActiveEditingDenom] = useState<"1" | "5" | "10" | "20" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Crop Editor State
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1.0);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [cropFitMode, setCropFitMode] = useState<"cover" | "contain" | "stretch">("cover");

  const [watermarkLightImg, setWatermarkLightImg] = useState<HTMLImageElement | null>(null);
  const [watermarkDarkImg, setWatermarkDarkImg] = useState<HTMLImageElement | null>(null);
  const [loadedSlotImages, setLoadedSlotImages] = useState<Record<string, HTMLImageElement>>({});

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeSlotInputRef = useRef<"1" | "5" | "10" | "20" | null>(null);

  useEffect(() => {
    const imgL = new Image();
    imgL.src = "/images/watermarks/watermark-light.svg";
    imgL.onload = () => setWatermarkLightImg(imgL);

    const imgD = new Image();
    imgD.src = "/images/watermarks/watermark-dark.svg";
    imgD.onload = () => setWatermarkDarkImg(imgD);

    fetchDenomSlots();
  }, []);

  // Preload Image elements for all custom denomination slots
  useEffect(() => {
    const newLoaded: Record<string, HTMLImageElement> = {};
    Object.keys(denomSlots).forEach((denom) => {
      const slot = denomSlots[denom];
      if (slot.image_url) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = slot.image_url;
        img.onload = () => {
          setLoadedSlotImages((prev) => ({ ...prev, [denom]: img }));
        };
      }
    });
  }, [denomSlots]);

  const fetchDenomSlots = async () => {
    const local = localStorage.getItem("dartbuck_denom_slots");
    if (local) {
      try {
        setDenomSlots(JSON.parse(local));
      } catch (err) {
        console.error("Failed to parse local denom slots", err);
      }
    }

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("dartbuck_denom_slots")
          .select("*");

        if (!error && data && data.length > 0) {
          const merged = { ...denomSlots };
          data.forEach((item: any) => {
            if (item.denom && merged[item.denom]) {
              merged[item.denom] = {
                denom: item.denom,
                title: item.title || `$${item.denom} Bill Artwork`,
                artist_name: item.artist_name || "Client Submission",
                image_url: item.image_url,
              };
            }
          });
          setDenomSlots(merged);
          localStorage.setItem("dartbuck_denom_slots", JSON.stringify(merged));
        }
      }
    } catch (e) {
      console.warn("Supabase denom slots fetch fallback");
    }
  };

  const saveSlotData = async (updatedSlots: Record<string, DenomArtSlot>) => {
    setDenomSlots(updatedSlots);
    localStorage.setItem("dartbuck_denom_slots", JSON.stringify(updatedSlots));

    try {
      if (supabase) {
        const upsertData = Object.values(updatedSlots).map((slot) => ({
          denom: slot.denom,
          title: slot.title,
          artist_name: slot.artist_name,
          image_url: slot.image_url,
          updated_at: new Date().toISOString(),
        }));
        await supabase.from("dartbuck_denom_slots").upsert(upsertData, { onConflict: "denom" });
      }
    } catch (e) {
      console.warn("Supabase slot upsert fallback");
    }
  };

  const computeBreakdown = (amount: number, weighting: "balanced" | "heavy" | "light") => {
    let remaining = Math.max(0, amount);
    let b20 = 0;
    let b10 = 0;
    let b5 = 0;
    let b1 = 0;

    if (weighting === "heavy") {
      b20 = Math.floor(remaining / 20);
      remaining %= 20;
      b10 = Math.floor(remaining / 10);
      remaining %= 10;
      b5 = Math.floor(remaining / 5);
      remaining %= 5;
      b1 = remaining;
    } else if (weighting === "light") {
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

  const handleSlotFileUpload = (denom: "1" | "5" | "10" | "20", file: File) => {
    if (!file) return;
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setActiveEditingDenom(denom);
      setCropImageSrc(dataUrl);
      setCropZoom(1.0);
      setCropOffsetX(0);
      setCropOffsetY(0);
      setCropFitMode("cover");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSlotInputRef.current) {
      handleSlotFileUpload(activeSlotInputRef.current, file);
    }
  };

  const triggerUploadForDenom = (denom: "1" | "5" | "10" | "20") => {
    activeSlotInputRef.current = denom;
    fileInputRef.current?.click();
  };

  const triggerEditForDenom = (denom: "1" | "5" | "10" | "20") => {
    const slot = denomSlots[denom];
    if (!slot || !slot.image_url) {
      triggerUploadForDenom(denom);
      return;
    }
    setActiveEditingDenom(denom);
    setCropImageSrc(slot.image_url);
    setCropZoom(1.0);
    setCropOffsetX(0);
    setCropOffsetY(0);
    setCropFitMode("cover");
  };

  // Render crop preview canvas (1200x469)
  const renderCropPreview = () => {
    if (!cropImageSrc || !cropCanvasRef.current) return;
    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 469;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 1200, 469);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = cropImageSrc;
    img.onload = () => {
      ctx.clearRect(0, 0, 1200, 469);

      if (cropFitMode === "stretch") {
        ctx.drawImage(img, 0, 0, 1200, 469);
      } else {
        const targetAspect = 1200 / 469;
        const imgAspect = img.width / img.height;

        let drawW = 1200 * cropZoom;
        let drawH = 469 * cropZoom;

        if (cropFitMode === "contain") {
          if (imgAspect > targetAspect) {
            drawW = 1200 * cropZoom;
            drawH = (1200 / imgAspect) * cropZoom;
          } else {
            drawH = 469 * cropZoom;
            drawW = (469 * imgAspect) * cropZoom;
          }
        } else {
          if (imgAspect > targetAspect) {
            drawH = 469 * cropZoom;
            drawW = (469 * imgAspect) * cropZoom;
          } else {
            drawW = 1200 * cropZoom;
            drawH = (1200 / imgAspect) * cropZoom;
          }
        }

        const drawX = (1200 - drawW) / 2 + cropOffsetX;
        const drawY = (469 - drawH) / 2 + cropOffsetY;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }
    };
  };

  useEffect(() => {
    if (activeEditingDenom && cropImageSrc) {
      renderCropPreview();
    }
  }, [activeEditingDenom, cropImageSrc, cropZoom, cropOffsetX, cropOffsetY, cropFitMode]);

  // Save Cropped Image to Denomination Slot permanently
  const applyCropAndSaveSlot = async () => {
    if (!activeEditingDenom || !cropCanvasRef.current) return;
    const canvas = cropCanvasRef.current;
    const croppedDataUrl = canvas.toDataURL("image/png");

    const updated = {
      ...denomSlots,
      [activeEditingDenom]: {
        ...denomSlots[activeEditingDenom],
        image_url: croppedDataUrl,
      },
    };

    await saveSlotData(updated);

    setActiveEditingDenom(null);
    setCropImageSrc(null);
  };

  const clearSlotArt = async (denom: "1" | "5" | "10" | "20", e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = {
      ...denomSlots,
      [denom]: {
        ...denomSlots[denom],
        image_url: null,
      },
    };
    await saveSlotData(updated);
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

  // Render DartBuck FRONT side (using denomination slot artwork if present)
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
    const slot = denomSlots[denomValue];
    const slotImg = loadedSlotImages[denomValue];

    // If specific Denomination Slot has uploaded custom artwork
    if (slot && slot.image_url && slotImg) {
      ctx.drawImage(slotImg, 0, 0, width, height);

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
      return;
    }

    // Default Monopoly Theme for Denomination
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

    ctx.strokeStyle = style.border;
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    ctx.strokeStyle = style.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, width - 56, height - 56);

    const wm = getContrastWatermark(style.circleBg);
    if (wm) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.drawImage(wm, width / 2 - 200, height / 2 - 200, 400, 400);
      ctx.restore();
    }

    ctx.fillStyle = style.border;
    ctx.font = "bold 110px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`$${denomValue}`, width / 2, height / 2 - 15);

    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText("DESERT AREA RESOURCES & TRAINING • EST. 1962", width / 2, height / 2 + 75);

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

  // Render Full A4 Sheet Preview
  const renderA4SheetPreview = (canvas: HTMLCanvasElement, isBack: boolean) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
      renderDartBuckOnCanvas(previewCanvasRef.current, config.startSerial);
    } else if (config.previewView === "sheet-front" && sheetCanvasRef.current) {
      renderA4SheetPreview(sheetCanvasRef.current, false);
    } else if (config.previewView === "sheet-back" && sheetCanvasRef.current) {
      renderA4SheetPreview(sheetCanvasRef.current, true);
    }
  }, [config, denomSlots, loadedSlotImages]);

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
      {/* Hidden File Input for Denom Art Slot Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Irreversible Crop & Scale Editor Modal */}
      {activeEditingDenom && cropImageSrc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl p-6 rounded-2xl border border-border shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Scissors className="w-6 h-6 text-red-500" />
                  Crop & Stretch Editor (${activeEditingDenom} Bill Art Slot)
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Fit, zoom, and stretch custom artwork to 1200 × 469 px resolution.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveEditingDenom(null);
                  setCropImageSrc(null);
                }}
                className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>

            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>
                <strong>Warning (No Undo / Redo):</strong> Once saved, the cropped areas outside the 1200×469 frame will be permanently saved to the database slot for ${activeEditingDenom} bills!
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
                      onClick={() => setCropFitMode(f.id as any)}
                      className={`py-1.5 px-2 rounded font-bold transition-all ${
                        cropFitMode === f.id
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
                  Zoom Scale: {cropZoom.toFixed(2)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.05"
                  value={cropZoom}
                  disabled={cropFitMode === "stretch"}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">
                  Horizontal Offset: {cropOffsetX}px
                </label>
                <input
                  type="range"
                  min="-600"
                  max="600"
                  step="10"
                  value={cropOffsetX}
                  disabled={cropFitMode === "stretch"}
                  onChange={(e) => setCropOffsetX(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => {
                  setActiveEditingDenom(null);
                  setCropImageSrc(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
              >
                Discard Changes
              </button>
              <button
                onClick={applyCropAndSaveSlot}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 shadow-lg"
              >
                <Save className="w-4 h-4" />
                Save & Assign to ${activeEditingDenom} Bills
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            DartBucks Cash Drawer & Individual Bill Art Tool
          </h1>
          <p className="text-muted-foreground mt-1">
            Assign custom client artwork to individual $20, $10, $5, and $1 bill slots with crop & stretch editor.
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

      {/* INDIVIDUAL DENOMINATION ART BUCKETS SECTION */}
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
            const isSelected = config.denomination === denom;

            return (
              <div
                key={denom}
                onClick={() => setConfig((prev) => ({ ...prev, denomination: denom }))}
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
                      triggerUploadForDenom(denom);
                    }}
                    className="flex-1 py-2 px-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Art
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerEditForDenom(denom);
                    }}
                    className="py-2 px-2 text-xs font-bold bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 flex items-center justify-center gap-1 border border-input"
                    title="Edit & Crop Art"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    Crop
                  </button>

                  {hasArt && (
                    <button
                      onClick={(e) => clearSlotArt(denom, e)}
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
                    onClick={regenerateBatchId}
                    className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
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
      </div>
    </div>
  );
}
