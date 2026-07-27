"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, RefreshCw, Trophy, ShieldCheck, Sparkles, Printer, Info } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { DartBuckConfig, PAPER_SPECS, BatchLogItem } from "./dart-bucks/types";
import { generateBatchId, computeBreakdown, getSerialString } from "./dart-bucks/utils/security";
import { renderDartBuckOnCanvas, renderDartBuckBackOnCanvas, drawDrawerAuditSlip, drawPdfCropMarks, renderSheetPreviewAsync } from "./dart-bucks/utils/canvasRenderer";
import { DrawerCalculatorControls } from "./dart-bucks/components/DrawerCalculatorControls";
import { PreviewPanel } from "./dart-bucks/components/PreviewPanel";
import { PrintAuthModal } from "./dart-bucks/components/PrintAuthModal";
import { BatchAuditLedger } from "./dart-bucks/components/BatchAuditLedger";

export default function DartBucksGenerator() {
  const [config, setConfig] = useState<DartBuckConfig>({
    mode: "drawer",
    drawerAmount: 200,
    drawerWeighting: "balanced",
    drawerBreakdown: { bill20: 7, bill10: 4, bill5: 3, bill1: 5 },
    stationPrefix: "COACH",
    batchId: generateBatchId(),
    startSerial: 1,
    cardCount: 10,
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
    validityMode: "forever",
    expirationDate: "2026-12-31",
  });

  const [batchLogs, setBatchLogs] = useState<BatchLogItem[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [watermarkLightImg, setWatermarkLightImg] = useState<HTMLImageElement | null>(null);
  const [watermarkDarkImg, setWatermarkDarkImg] = useState<HTMLImageElement | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const imgL = new Image();
    imgL.src = "/images/watermarks/watermark-light.svg";
    imgL.onload = () => setWatermarkLightImg(imgL);

    const imgD = new Image();
    imgD.src = "/images/watermarks/watermark-dark.svg";
    imgD.onload = () => setWatermarkDarkImg(imgD);

    fetchBatchLogs();
  }, []);

  const fetchBatchLogs = async () => {
    const local = localStorage.getItem("dartbuck_batch_logs");
    if (local) {
      try {
        setBatchLogs(JSON.parse(local));
      } catch (err) {
        console.error("Failed to parse local batch logs", err);
      }
    }

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("dartbuck_batch_logs")
          .select("*")
          .order("printed_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setBatchLogs(data);
          localStorage.setItem("dartbuck_batch_logs", JSON.stringify(data));
        }
      }
    } catch (e) {
      console.warn("Supabase batch logs fetch fallback");
    }
  };

  const saveBatchLog = async (logItem: BatchLogItem) => {
    const updated = [logItem, ...batchLogs];
    setBatchLogs(updated);
    localStorage.setItem("dartbuck_batch_logs", JSON.stringify(updated));

    try {
      if (supabase) {
        await supabase.from("dartbuck_batch_logs").insert([logItem]);
      }
    } catch (e) {
      console.warn("Supabase batch log insert fallback");
    }
  };

  const toggleBatchCycleComplete = async (logId: string) => {
    const updated = batchLogs.map((log) => {
      if (log.id === logId) {
        const isNowCompleted = log.status !== "completed";
        return {
          ...log,
          status: isNowCompleted ? ("completed" as const) : ("active" as const),
          completed_at: isNowCompleted ? new Date().toISOString() : undefined,
        };
      }
      return log;
    });

    setBatchLogs(updated);
    localStorage.setItem("dartbuck_batch_logs", JSON.stringify(updated));

    try {
      if (supabase) {
        const target = updated.find((l) => l.id === logId);
        if (target) {
          await supabase
            .from("dartbuck_batch_logs")
            .update({
              status: target.status,
              completed_at: target.completed_at || null,
            })
            .eq("id", logId);
        }
      }
    } catch (e) {
      console.warn("Supabase batch status update fallback");
    }
  };

  const markBatchAsShredded = async (logId: string) => {
    if (!confirm("Confirm handing over remaining unused bills from this batch to the DART Shredding Department for destruction?")) {
      return;
    }

    const updated = batchLogs.map((log) => {
      if (log.id === logId) {
        return {
          ...log,
          status: "shredded" as const,
          shredded_at: new Date().toISOString(),
        };
      }
      return log;
    });

    setBatchLogs(updated);
    localStorage.setItem("dartbuck_batch_logs", JSON.stringify(updated));

    try {
      if (supabase) {
        await supabase
          .from("dartbuck_batch_logs")
          .update({
            status: "shredded",
            shredded_at: new Date().toISOString(),
          })
          .eq("id", logId);
      }
    } catch (e) {
      console.warn("Supabase batch shred status update fallback");
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
    setCurrentPageIndex(0);
  };

  const handleWeightingChange = (weighting: "balanced" | "heavy" | "light") => {
    const breakdown = computeBreakdown(config.drawerAmount, weighting);
    setConfig((prev) => ({
      ...prev,
      drawerWeighting: weighting,
      drawerBreakdown: breakdown,
    }));
    setCurrentPageIndex(0);
  };

  const getDrawerBillQueue = () => {
    const queue: { denom: string; serial: number }[] = [];
    let currentSerial = config.startSerial;

    if (config.mode === "drawer") {
      for (let i = 0; i < config.drawerBreakdown.bill20; i++) {
        queue.push({ denom: "20", serial: currentSerial++ });
      }
      for (let i = 0; i < config.drawerBreakdown.bill10; i++) {
        queue.push({ denom: "10", serial: currentSerial++ });
      }
      for (let i = 0; i < config.drawerBreakdown.bill5; i++) {
        queue.push({ denom: "5", serial: currentSerial++ });
      }
      for (let i = 0; i < config.drawerBreakdown.bill1; i++) {
        queue.push({ denom: "1", serial: currentSerial++ });
      }
    } else {
      for (let i = 0; i < config.cardCount; i++) {
        queue.push({ denom: config.denomination, serial: currentSerial++ });
      }
    }
    return queue;
  };

  useEffect(() => {
    if (config.previewView === "card" && previewCanvasRef.current) {
      renderDartBuckOnCanvas(previewCanvasRef.current, config.startSerial, config, {}, {}, watermarkLightImg, watermarkDarkImg, config.denomination, 1200, 600);
    } else if (config.previewView === "sheet-front" && sheetCanvasRef.current) {
      renderSheetPreviewAsync(sheetCanvasRef.current, false, currentPageIndex, config, getDrawerBillQueue, watermarkLightImg, watermarkDarkImg);
    } else if (config.previewView === "sheet-back" && sheetCanvasRef.current) {
      renderSheetPreviewAsync(sheetCanvasRef.current, true, currentPageIndex, config, getDrawerBillQueue, watermarkLightImg, watermarkDarkImg);
    }
  }, [config, watermarkLightImg, watermarkDarkImg, currentPageIndex]);

  const initiatePrintRequest = () => {
    setShowAuthModal(true);
  };

  const executeAuthorizedPrint = async (authData: {
    issuerName: string;
    department: string;
    issuerRole: string;
    issueReason: string;
  }) => {
    setShowAuthModal(false);
    setIsGenerating(true);

    try {
      const totalBills = config.mode === "drawer"
        ? (config.drawerBreakdown.bill20 + config.drawerBreakdown.bill10 + config.drawerBreakdown.bill5 + config.drawerBreakdown.bill1)
        : config.cardCount;

      const totalVal = config.mode === "drawer"
        ? config.drawerAmount
        : config.cardCount * (parseFloat(config.denomination) || 1);

      const startStr = getSerialString(config.stationPrefix, config.batchId, config.startSerial, config.digits, config.includeChecksum);
      const endStr = getSerialString(config.stationPrefix, config.batchId, config.startSerial + totalBills - 1, config.digits, config.includeChecksum);

      const logItem: BatchLogItem = {
        id: "log_" + Math.random().toString(36).substring(2, 10),
        batch_id: config.batchId,
        station_prefix: config.stationPrefix,
        issuer_name: authData.issuerName,
        issuer_role: authData.issuerRole,
        department: authData.department,
        mode: config.mode,
        drawer_amount: totalVal,
        total_bills_count: totalBills,
        itemized_breakdown: config.mode === "drawer" ? config.drawerBreakdown : {
          bill20: config.denomination === "20" ? config.cardCount : 0,
          bill10: config.denomination === "10" ? config.cardCount : 0,
          bill5: config.denomination === "5" ? config.cardCount : 0,
          bill1: config.denomination === "1" ? config.cardCount : 0,
        },
        serial_start: startStr,
        serial_end: endStr,
        issue_reason: authData.issueReason,
        printed_at: new Date().toISOString(),
        status: "active",
      };

      await saveBatchLog(logItem);

      // Execute Vector PDF Creation
      const { jsPDF } = await import("jspdf");
      const paperSpec = PAPER_SPECS[config.paperSize] || PAPER_SPECS["11x12-14"];

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [paperSpec.widthMm, paperSpec.heightMm],
      });

      const cols = paperSpec.cols;
      const rows = paperSpec.rows;
      const cardWidthMm = 101.6;
      const cardHeightMm = 50.8;
      const gapX = config.gutterMm;
      const gapY = config.gutterMm;

      const marginX = (paperSpec.widthMm - (cols * cardWidthMm + (cols - 1) * gapX)) / 2;
      const marginY = (paperSpec.heightMm - (rows * cardHeightMm + (rows - 1) * gapY)) / 2;

      if (config.mode === "drawer") {
        const auditCanvas = document.createElement("canvas");
        drawDrawerAuditSlip(auditCanvas, config.drawerAmount, config.drawerBreakdown, config.batchId, config.stationPrefix);
        const auditImg = auditCanvas.toDataURL("image/png");
        doc.addImage(auditImg, "PNG", 0, 0, paperSpec.widthMm, paperSpec.heightMm);
        doc.addPage();
      }

      const billQueue = getDrawerBillQueue();

      const frontCanvas = document.createElement("canvas");
      frontCanvas.width = 1200;
      frontCanvas.height = 600;

      const backCanvas = document.createElement("canvas");
      backCanvas.width = 1200;
      backCanvas.height = 600;

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
          renderDartBuckOnCanvas(frontCanvas, item.serial, config, {}, {}, watermarkLightImg, watermarkDarkImg, item.denom, 1200, 600);
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
            renderDartBuckBackOnCanvas(backCanvas, item.serial, config, watermarkLightImg, watermarkDarkImg, item.denom, 1200, 600);
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

  const totalCalculatedBills = config.mode === "drawer"
    ? (config.drawerBreakdown.bill20 + config.drawerBreakdown.bill10 + config.drawerBreakdown.bill5 + config.drawerBreakdown.bill1)
    : config.cardCount;

  const totalCalculatedValue = config.mode === "drawer"
    ? config.drawerAmount
    : config.cardCount * (parseFloat(config.denomination) || 1);

  const paperSpec = PAPER_SPECS[config.paperSize] || PAPER_SPECS["11x12-14"];
  const calculatedTotalPages = Math.ceil(totalCalculatedBills / paperSpec.billsPerSheet) || 1;

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Print Authorization Safeguard Modal */}
      {showAuthModal && (
        <PrintAuthModal
          batchId={config.batchId}
          totalAmount={totalCalculatedValue}
          totalBills={totalCalculatedBills}
          stationPrefix={config.stationPrefix}
          onAuthorize={executeAuthorizedPrint}
          onCancel={() => setShowAuthModal(false)}
        />
      )}

      {/* Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between bg-card p-6 rounded-xl border border-border shadow-sm gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            DartBucks Cash Drawer & Monopoly Prepress Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Async front sheet grid preview, itemized bill dispersion ($20s, $10s, $5s, $1s), 4.0"×2.0" Monopoly size, & prepress PDF crop marks.
          </p>
        </div>

        <button
          onClick={initiatePrintRequest}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-lg text-xs"
        >
          {isGenerating ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-200" />
          )}
          {isGenerating ? "Generating Prepress PDF..." : "Export Prepress PDF"}
        </button>
      </div>

      {/* Itemized Drawer Weighting Notice */}
      <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-xs">
        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="flex-1">
          <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
            Front & Back Sheet Grid Live Preview Active (${config.drawerAmount} Allotment)
          </span>
          <span className="text-muted-foreground">
            Current Breakdown: <strong>{config.drawerBreakdown.bill20} × $20s</strong> (${config.drawerBreakdown.bill20 * 20}), <strong>{config.drawerBreakdown.bill10} × $10s</strong> (${config.drawerBreakdown.bill10 * 10}), <strong>{config.drawerBreakdown.bill5} × $5s</strong> (${config.drawerBreakdown.bill5 * 5}), <strong>{config.drawerBreakdown.bill1} × $1s</strong> (${config.drawerBreakdown.bill1}). Live preview renders all 10 bills per prepress sheet via Promise.all vector rendering.
          </span>
        </div>
      </div>

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
            denomSlots={{}}
            previewCanvasRef={previewCanvasRef}
            sheetCanvasRef={sheetCanvasRef}
            currentPageIndex={currentPageIndex}
            onPageIndexChange={setCurrentPageIndex}
            totalDrawerBills={totalCalculatedBills}
            totalPages={calculatedTotalPages}
          />
        </div>
      </div>

      {/* MONTHLY BATCH AUDIT LEDGER TABLE */}
      <BatchAuditLedger
        logs={batchLogs}
        onToggleComplete={toggleBatchCycleComplete}
        onMarkShredded={markBatchAsShredded}
      />
    </div>
  );
}
