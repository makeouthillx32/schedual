"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, RefreshCw, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { DartBuckConfig, DenomArtSlot, PAPER_SPECS } from "./dart-bucks/types";
import { generateBatchId, computeBreakdown } from "./dart-bucks/utils/security";
import { renderDartBuckOnCanvas, renderDartBuckBackOnCanvas, drawDrawerAuditSlip, drawPdfCropMarks } from "./dart-bucks/utils/canvasRenderer";
import { DenomArtBuckets } from "./dart-bucks/components/DenomArtBuckets";
import { CropEditorModal } from "./dart-bucks/components/CropEditorModal";
import { DrawerCalculatorControls } from "./dart-bucks/components/DrawerCalculatorControls";
import { PreviewPanel } from "./dart-bucks/components/PreviewPanel";

export default function DartBucksGenerator() {
  const [config, setConfig] = useState<DartBuckConfig>({
    mode: "drawer",
    drawerAmount: 200,
    drawerWeighting: "balanced",
    drawerBreakdown: { bill20: 7, bill10: 4, bill5: 3, bill1: 5 },
    stationPrefix: "COACH",
    batchId: generateBatchId(),
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
    paperSize: "11x12-14",
    includeCropMarks: true,
    bleedMm: 3,
    gutterMm: 6,
    previewView: "card",
    serialPosition: "bottom",
  });

  const [denomSlots, setDenomSlots] = useState<Record<string, DenomArtSlot>>({
    "1": { denom: "1", title: "$1 Bill Artwork", artist_name: "Client Submission", image_url: null },
    "5": { denom: "5", title: "$5 Bill Artwork", artist_name: "Client Submission", image_url: null },
    "10": { denom: "10", title: "$10 Bill Artwork", artist_name: "Client Submission", image_url: null },
    "20": { denom: "20", title: "$20 Bill Artwork", artist_name: "Client Submission", image_url: null },
  });

  const [activeEditingDenom, setActiveEditingDenom] = useState<"1" | "5" | "10" | "20" | null>(null);
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

  useEffect(() => {
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
        const { data, error } = await supabase.from("dartbuck_denom_slots").select("*");
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
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setActiveEditingDenom(denom);
      setCropImageSrc(dataUrl);
      setCropZoom(1.0);
      setCropOffsetX(0);
      setCropOffsetY(0);
      setCropFitMode("cover");
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

  useEffect(() => {
    if (config.previewView === "card" && previewCanvasRef.current) {
      renderDartBuckOnCanvas(previewCanvasRef.current, config.startSerial, config, denomSlots, loadedSlotImages, watermarkLightImg, watermarkDarkImg);
    } else if (config.previewView === "sheet-front" && sheetCanvasRef.current) {
      renderSheetPreview(sheetCanvasRef.current, false);
    } else if (config.previewView === "sheet-back" && sheetCanvasRef.current) {
      renderSheetPreview(sheetCanvasRef.current, true);
    }
  }, [config, denomSlots, loadedSlotImages, watermarkLightImg, watermarkDarkImg]);

  const renderSheetPreview = (canvas: HTMLCanvasElement, isBack: boolean) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const paperSpec = PAPER_SPECS[config.paperSize] || PAPER_SPECS["11x12-14"];
    canvas.width = Math.round(paperSpec.widthMm * 5.5);
    canvas.height = Math.round(paperSpec.heightMm * 5.5);

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    const cols = paperSpec.cols;
    const rows = paperSpec.rows;
    const cardW = Math.round(5.5 * 95);
    const cardH = Math.round(5.5 * 37.1);
    const gapX = Math.round(5.5 * config.gutterMm);
    const gapY = Math.round(5.5 * config.gutterMm);

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
          renderDartBuckBackOnCanvas(tempCanvas, serialIdx, config, watermarkLightImg, watermarkDarkImg);
        } else {
          renderDartBuckOnCanvas(tempCanvas, serialIdx, config, denomSlots, loadedSlotImages, watermarkLightImg, watermarkDarkImg);
        }

        ctx.drawImage(tempCanvas, x, y, cardW, cardH);

        // Draw visual cut guidelines in preview
        if (config.includeCropMarks) {
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 1;
          ctx.strokeRect(x - 2, y - 2, cardW + 4, cardH + 4);
        }

        serialIdx++;
      }
    }

    ctx.fillStyle = isBack ? "#1e1b4b" : "#064e3b";
    ctx.fillRect(marginX, 15, cols * cardW + (cols - 1) * gapX, 36);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `${paperSpec.label.toUpperCase()} - ${isBack ? "BACK SIDE (DUPLEX MIRRORED)" : "FRONT SIDE (6mm DOUBLE-CUT GUTTERS)"}`,
      canvas.width / 2,
      38
    );
  };

  const downloadPDF = async () => {
    setIsGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const paperSpec = PAPER_SPECS[config.paperSize] || PAPER_SPECS["11x12-14"];

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [paperSpec.widthMm, paperSpec.heightMm],
      });

      const cols = paperSpec.cols;
      const rows = paperSpec.rows;
      const cardWidthMm = 95;
      const cardHeightMm = 37.1;
      const gapX = config.gutterMm;
      const gapY = config.gutterMm;

      const marginX = (paperSpec.widthMm - (cols * cardWidthMm + (cols - 1) * gapX)) / 2;
      const marginY = (paperSpec.heightMm - (rows * cardHeightMm + (rows - 1) * gapY)) / 2;

      // PAGE 1: Cash Drawer Audit Slip (If in Drawer mode)
      if (config.mode === "drawer") {
        const auditCanvas = document.createElement("canvas");
        drawDrawerAuditSlip(auditCanvas, config.drawerAmount, config.drawerBreakdown, config.batchId, config.stationPrefix);
        const auditImg = auditCanvas.toDataURL("image/png");
        doc.addImage(auditImg, "PNG", 0, 0, paperSpec.widthMm, paperSpec.heightMm);
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
          renderDartBuckOnCanvas(frontCanvas, item.serial, config, denomSlots, loadedSlotImages, watermarkLightImg, watermarkDarkImg, item.denom, 1200, 469);
          const imgData = frontCanvas.toDataURL("image/png");

          const col = i % cols;
          const row = Math.floor(i / cols);

          const x = marginX + col * (cardWidthMm + gapX);
          const y = marginY + row * (cardHeightMm + gapY);

          doc.addImage(imgData, "PNG", x, y, cardWidthMm, cardHeightMm);

          if (config.includeCropMarks) {
            drawPdfCropMarks(doc, x, y, cardWidthMm, cardHeightMm, config.bleedMm, 4);
          }
        }

        // DUPLEX BACK PAGE
        if (config.includeDuplexBacks) {
          doc.addPage();
          for (let i = 0; i < cols * rows; i++) {
            const queueIndex = p * (cols * rows) + i;
            if (queueIndex >= billQueue.length) break;

            const item = billQueue[queueIndex];
            renderDartBuckBackOnCanvas(backCanvas, item.serial, config, watermarkLightImg, watermarkDarkImg, item.denom, 1200, 469);
            const imgDataBack = backCanvas.toDataURL("image/png");

            const col = i % cols;
            const row = Math.floor(i / cols);

            const mirroredCol = cols - 1 - col;

            const x = marginX + mirroredCol * (cardWidthMm + gapX);
            const y = marginY + row * (cardHeightMm + gapY);

            doc.addImage(imgDataBack, "PNG", x, y, cardWidthMm, cardHeightMm);

            if (config.includeCropMarks) {
              drawPdfCropMarks(doc, x, y, cardWidthMm, cardHeightMm, config.bleedMm, 4);
            }
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
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {activeEditingDenom && cropImageSrc && (
        <CropEditorModal
          denom={activeEditingDenom}
          imageSrc={cropImageSrc}
          zoom={cropZoom}
          offsetX={cropOffsetX}
          offsetY={cropOffsetY}
          fitMode={cropFitMode}
          onZoomChange={setCropZoom}
          onOffsetXChange={setCropOffsetX}
          onOffsetYChange={setCropOffsetY}
          onFitModeChange={setCropFitMode}
          onClose={() => {
            setActiveEditingDenom(null);
            setCropImageSrc(null);
          }}
          onSave={applyCropAndSaveSlot}
          cropCanvasRef={cropCanvasRef}
        />
      )}

      {/* Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            DartBucks Cash Drawer & Vector Bleed Print Tool
          </h1>
          <p className="text-muted-foreground mt-1">
            Print 11"×12", Letter, or A4 sheets with 3mm bleeds, 6mm double-cut gutters, & hairline guillotine crop marks.
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
          {isGenerating ? "Generating Prepress PDF..." : "Export Prepress PDF"}
        </button>
      </div>

      {/* INDIVIDUAL BILL ART BUCKETS */}
      <DenomArtBuckets
        denomSlots={denomSlots}
        selectedDenom={config.denomination}
        onSelectDenom={(denom) => setConfig((prev) => ({ ...prev, denomination: denom }))}
        onUpload={triggerUploadForDenom}
        onEdit={triggerEditForDenom}
        onClear={clearSlotArt}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Controls */}
        <div className="lg:col-span-5">
          <DrawerCalculatorControls
            config={config}
            setConfig={setConfig}
            onDrawerAmountChange={handleDrawerAmountChange}
            onWeightingChange={handleWeightingChange}
            onRegenerateBatchId={() => setConfig((prev) => ({ ...prev, batchId: generateBatchId() }))}
          />
        </div>

        {/* Right Column - Live Preview */}
        <div className="lg:col-span-7">
          <PreviewPanel
            config={config}
            setConfig={setConfig}
            denomSlots={denomSlots}
            previewCanvasRef={previewCanvasRef}
            sheetCanvasRef={sheetCanvasRef}
          />
        </div>
      </div>
    </div>
  );
}
