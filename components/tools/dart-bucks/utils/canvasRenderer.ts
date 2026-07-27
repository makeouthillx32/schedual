import { DartBuckConfig, DENOMINATIONS, DenomArtSlot, PAPER_SPECS, PaperSpec, BillScalePreset } from "../types";
import { getSerialString, isLightBg, MONTH_NAMES_FULL } from "./security";
import { generateDartBuckSVG, MONTHLY_PALETTES, DESTRUCTIVE_SHRED_COLORS } from "./svgGenerator";

export const getContrastWatermark = (
  bgColorHex: string,
  mode: "auto" | "dark" | "light" | "none",
  showWatermark: boolean,
  lightImg: HTMLImageElement | null,
  darkImg: HTMLImageElement | null
): HTMLImageElement | null => {
  if (mode === "none" || !showWatermark) return null;
  if (mode === "light") return lightImg;
  if (mode === "dark") return darkImg;
  return isLightBg(bgColorHex) ? darkImg : lightImg;
};

// Calculate exact non-cut-off card dimensions respecting printable margin safety boundaries
export const getCardDimensionsMm = (paperSpec: PaperSpec, billScale: BillScalePreset = "large") => {
  if (billScale === "standard") {
    return { w: 101.6, h: 50.8 };
  }

  if (billScale === "large") {
    return { w: paperSpec.defaultCardWidthMm, h: paperSpec.defaultCardHeightMm };
  }

  // Size 3 (Jumbo Max Coverage): Maximize bill dimensions to physical margin safety boundary (6mm margins)
  const safeMarginMm = 6.0;
  const gutterMm = 6.0;

  const availWidthMm = paperSpec.widthMm - (2 * safeMarginMm) - ((paperSpec.cols - 1) * gutterMm);
  const availHeightMm = paperSpec.heightMm - (2 * safeMarginMm) - ((paperSpec.rows - 1) * gutterMm);

  const maxW = Math.floor((availWidthMm / paperSpec.cols) * 10) / 10;
  const maxH = Math.floor((availHeightMm / paperSpec.rows) * 10) / 10;

  return { w: Math.max(90, maxW), h: Math.max(50, maxH) };
};

// Pure Synchronous 2D Canvas Front Bill Renderer (100% Bulletproof for PDF & Canvas Exports)
export const renderDartBuckOnCanvasDirect = (
  canvas: HTMLCanvasElement,
  serialNum: number,
  config: DartBuckConfig,
  denomValue = config.denomination,
  width = 1200,
  height = 600
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);

  const now = new Date();
  const monthIdx = typeof config.monthOverride === "number" ? config.monthOverride : now.getMonth();
  const isDestructive = config.validityMode === "expires";
  const activePalette = MONTHLY_PALETTES[monthIdx] || MONTHLY_PALETTES[6];

  const colors = isDestructive
    ? DESTRUCTIVE_SHRED_COLORS[denomValue] || DESTRUCTIVE_SHRED_COLORS["1"]
    : activePalette.denoms[denomValue] || activePalette.denoms["1"];

  const serialStr = getSerialString(config.stationPrefix, config.batchId, serialNum, config.digits, config.includeChecksum);
  const currentMonthYearStr = `${MONTH_NAMES_FULL[monthIdx].toUpperCase()} ${now.getFullYear()}`;

  const finePrintNotice = isDestructive
    ? `MUST BE DESTROYED BY DART SHRED DEPT ON: ${config.expirationDate || "END OF MONTH"} • BATCH: ${config.batchId}`
    : `VALID FOREVER ∞ • ISSUED: ${currentMonthYearStr} • BATCH: ${config.batchId}`;

  // 1. White Matte Base
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  if (config.showPresetBorders) {
    // 2. Outer Solid Border
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // 3. Middle Accent Frame
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // 4. Inner Decorative Dashed Line
    ctx.save();
    ctx.fillStyle = colors.innerTint;
    ctx.fillRect(52, 52, width - 104, height - 104);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(52, 52, width - 104, height - 104);
    ctx.restore();

    // 5. Left Side Panel (DART Crest Box)
    const leftX = 90;
    const boxY = height / 2 - 50;
    ctx.fillStyle = colors.circleBg;
    ctx.fillRect(leftX, boxY, 140, 100);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(leftX, boxY, 140, 100);

    ctx.fillStyle = colors.text;
    ctx.font = "900 28px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("DART", leftX + 70, boxY + 44);

    ctx.beginPath();
    ctx.moveTo(leftX + 20, boxY + 56);
    ctx.lineTo(leftX + 120, boxY + 56);
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors.border;
    ctx.stroke();

    ctx.fillStyle = colors.border;
    ctx.font = "800 11px sans-serif";
    ctx.fillText("EST. 1962", leftX + 70, boxY + 74);

    // 6. Right Side Panel (DART House Icon Box)
    const rightX = width - 230;
    ctx.fillStyle = colors.circleBg;
    ctx.fillRect(rightX, boxY, 140, 100);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(rightX, boxY, 140, 100);

    ctx.fillStyle = colors.border;
    ctx.beginPath();
    ctx.moveTo(rightX + 70, boxY + 20);
    ctx.lineTo(rightX + 25, boxY + 55);
    ctx.lineTo(rightX + 38, boxY + 55);
    ctx.lineTo(rightX + 38, boxY + 82);
    ctx.lineTo(rightX + 102, boxY + 82);
    ctx.lineTo(rightX + 102, boxY + 55);
    ctx.lineTo(rightX + 115, boxY + 55);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colors.circleBg;
    ctx.fillRect(rightX + 56, boxY + 60, 28, 22);

    // 7. 4 Corner Denomination Boxes
    const cornerBoxes = [
      { x: 80, y: 70 },
      { x: width - 190, y: 70 },
      { x: 80, y: height - 130 },
      { x: width - 190, y: height - 130 },
    ];

    cornerBoxes.forEach((cb) => {
      ctx.fillStyle = colors.circleBg;
      ctx.fillRect(cb.x, cb.y, 110, 60);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 4;
      ctx.strokeRect(cb.x, cb.y, 110, 60);

      ctx.fillStyle = colors.text;
      ctx.font = "900 42px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText(denomValue, cb.x + 55, cb.y + 44);
    });
  }

  if (config.showPresetText) {
    // 8. Center Monopoly Circle
    const cx = width / 2;
    const cy = height / 2;

    ctx.beginPath();
    ctx.arc(cx, cy, 180, 0, Math.PI * 2);
    ctx.fillStyle = colors.circleBg;
    ctx.fill();
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 168, 0, Math.PI * 2);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.stroke();
    ctx.restore();

    // Giant Center Numeral
    ctx.font = "900 170px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Text Shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillText(denomValue, cx + 2, cy + 22);

    // Text Stroke & Fill
    ctx.fillStyle = colors.text;
    ctx.fillText(denomValue, cx, cy + 20);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 3.2;
    ctx.strokeText(denomValue, cx, cy + 20);

    // Curved Text "DART BUCKS®"
    ctx.font = "900 16px sans-serif";
    ctx.fillStyle = colors.border;
    ctx.fillText("• DART BUCKS ® •", cx, cy + 145);
  }

  // 9. Serial Box Overlay
  const serialX = width / 2 - 280;
  const serialY = height - 65;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(serialX, serialY, 560, 42);
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(serialX, serialY, 560, 42);

  ctx.font = "bold 24px monospace";
  ctx.fillStyle = isDestructive ? "#dc2626" : "#b91c1c";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(serialStr, width / 2, serialY + 28);

  // 10. Fine Print Literature Notice
  ctx.font = "bold 10px sans-serif";
  ctx.fillStyle = colors.border;
  ctx.textAlign = "left";
  ctx.fillText(finePrintNotice, 45, height - 24);
};

// Render Dynamic Pure SVG Vector onto HTML5 Canvas
export const renderDartBuckOnCanvas = (
  canvas: HTMLCanvasElement,
  serialNum: number,
  config: DartBuckConfig,
  denomSlots: Record<string, DenomArtSlot> = {},
  loadedSlotImages: Record<string, HTMLImageElement> = {},
  watermarkLightImg: HTMLImageElement | null = null,
  watermarkDarkImg: HTMLImageElement | null = null,
  denomValue = config.denomination,
  width = 1200,
  height = 600
) => {
  renderDartBuckOnCanvasDirect(canvas, serialNum, config, denomValue, width, height);
};

// Render DartBuck BACK side
export const renderDartBuckBackOnCanvas = (
  canvas: HTMLCanvasElement,
  serialNum: number,
  config: DartBuckConfig,
  watermarkLightImg: HTMLImageElement | null,
  watermarkDarkImg: HTMLImageElement | null,
  denomValue = config.denomination,
  width = 1200,
  height = 600
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
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  ctx.strokeStyle = style.accent;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  const wm = getContrastWatermark(style.circleBg, config.watermarkMode, config.showWatermark, watermarkLightImg, watermarkDarkImg);
  if (wm) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.drawImage(wm, width / 2 - 220, height / 2 - 220, 440, 440);
    ctx.restore();
  }

  ctx.fillStyle = style.border;
  ctx.font = "bold 130px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`$${denomValue}`, width / 2, height / 2 - 20);

  ctx.font = "bold 20px sans-serif";
  ctx.fillStyle = "#475569";
  ctx.fillText("DESERT AREA RESOURCES & TRAINING • EST. 1962", width / 2, height / 2 + 90);

  const serialStr = getSerialString(config.stationPrefix, config.batchId, serialNum, config.digits, config.includeChecksum);
  ctx.font = "bold 22px monospace";
  ctx.fillStyle = "#0f172a";
  ctx.textAlign = "right";
  ctx.fillText(serialStr, width - 50, height - 45);
};

// Async Prepress Sheet Grid Preview Renderer with Scaled Full-Paper Coverage & Centered Margins
export const renderSheetPreviewAsync = async (
  canvas: HTMLCanvasElement,
  isBack: boolean,
  pageIdx = 0,
  config: DartBuckConfig,
  getDrawerBillQueue: () => { denom: string; serial: number }[],
  watermarkLightImg: HTMLImageElement | null,
  watermarkDarkImg: HTMLImageElement | null
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const paperSpec = PAPER_SPECS[config.paperSize] || PAPER_SPECS["letter"];
  const scaleFactor = 4; // High DPI preview resolution

  const paperWidthPx = Math.round(paperSpec.widthMm * scaleFactor);
  const paperHeightPx = Math.round(paperSpec.heightMm * scaleFactor);

  canvas.width = paperWidthPx;
  canvas.height = paperHeightPx;

  // Background Paper Stock (Clean White Sheet with Outer Border)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, paperWidthPx, paperHeightPx);

  // Outer Paper Boundary & Drop Shadow Line
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 6;
  ctx.strokeRect(12, 12, paperWidthPx - 24, paperHeightPx - 24);

  const cols = paperSpec.cols;
  const rows = paperSpec.rows;
  const billsPerPage = cols * rows;

  const cardDims = getCardDimensionsMm(paperSpec, config.billScale);
  const cardWidthMm = cardDims.w;
  const cardHeightMm = cardDims.h;

  const gapXmm = config.gutterMm;
  const gapYmm = config.gutterMm;

  const cardW = Math.round(cardWidthMm * scaleFactor);
  const cardH = Math.round(cardHeightMm * scaleFactor);
  const gapX = Math.round(gapXmm * scaleFactor);
  const gapY = Math.round(gapYmm * scaleFactor);

  const gridWidthPx = cols * cardW + (cols - 1) * gapX;
  const gridHeightPx = rows * cardH + (rows - 1) * gapY;

  // Perfectly Centered Sheet Margins
  const marginX = Math.max(16, (paperWidthPx - gridWidthPx) / 2);
  const marginY = Math.max(50, (paperHeightPx - gridHeightPx) / 2);

  const billQueue = getDrawerBillQueue();
  const startIndex = pageIdx * billsPerPage;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = 1200;
  tempCanvas.height = 600;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const gridIndex = r * cols + c;
      const queueIdx = startIndex + gridIndex;
      if (queueIdx >= billQueue.length) break;

      const item = billQueue[queueIdx];
      // Duplex Long-Edge Mirroring for Back Pages
      const colToDraw = isBack ? cols - 1 - c : c;

      const x = Math.round(marginX + colToDraw * (cardW + gapX));
      const y = Math.round(marginY + r * (cardH + gapY));

      if (isBack) {
        renderDartBuckBackOnCanvas(tempCanvas, item.serial, config, watermarkLightImg, watermarkDarkImg, item.denom, 1200, 600);
      } else {
        renderDartBuckOnCanvasDirect(tempCanvas, item.serial, config, item.denom, 1200, 600);
      }

      ctx.drawImage(tempCanvas, x, y, cardW, cardH);

      // Prepress Crop Mark Guides
      if (config.includeCropMarks) {
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - 2, y - 2, cardW + 4, cardH + 4);
      }
    }
  }

  const totalPages = Math.ceil(billQueue.length / billsPerPage) || 1;

  // Header Banner on Prepress Sheet
  ctx.fillStyle = isBack ? "#1e1b4b" : "#064e3b";
  ctx.fillRect(16, 16, paperWidthPx - 32, 40);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `${paperSpec.label.toUpperCase()} (${paperSpec.widthMm}mm × ${paperSpec.heightMm}mm) • SHEET ${pageIdx + 1} OF ${totalPages} • ${isBack ? "BACK DUPLEX MIRRORED" : "FRONT SHEET GRID"}`,
    paperWidthPx / 2,
    41
  );
};

// Draw Hairline Vector Crop Marks
export const drawPdfCropMarks = (
  doc: any,
  x: number,
  y: number,
  w: number,
  h: number,
  bleedOffset = 3,
  markLength = 4
) => {
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.1);

  // Top-Left Corner
  doc.line(x - bleedOffset - markLength, y, x - bleedOffset, y);
  doc.line(x, y - bleedOffset - markLength, x, y - bleedOffset);

  // Top-Right Corner
  doc.line(x + w + bleedOffset, y, x + w + bleedOffset + markLength, y);
  doc.line(x + w, y - bleedOffset - markLength, x + w, y - bleedOffset);

  // Bottom-Left Corner
  doc.line(x - bleedOffset - markLength, y + h, x - bleedOffset, y + h);
  doc.line(x, y + h + bleedOffset, x, y + h + bleedOffset + markLength);

  // Bottom-Right Corner
  doc.line(x + w + bleedOffset, y + h, x + w + bleedOffset + markLength, y + h);
  doc.line(x + w, y + h + bleedOffset, x + w, y + h + bleedOffset + markLength);
};

// Draw Drawer Audit Slip Page 1 (Front Receipt)
export const drawDrawerAuditSlip = (
  canvas: HTMLCanvasElement,
  totalValue: number,
  breakdown: { bill20: number; bill10: number; bill5: number; bill1: number },
  batchId: string,
  stationPrefix: string
) => {
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
  ctx.fillText(`BATCH AUDIT ID: ${batchId}`, 100, 350);
  ctx.fillText(`ISSUING STATION: ${stationPrefix}`, 100, 400);

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

// Draw Drawer Audit Slip Page 2 (Back Verso Page for Perfect Duplex Sheet Alignment)
export const drawDrawerAuditSlipBack = (
  canvas: HTMLCanvasElement,
  batchId: string
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = 1200;
  canvas.height = 1697;

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  ctx.fillStyle = "#64748b";
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("DESERT AREA RESOURCES & TRAINING", canvas.width / 2, canvas.height / 2 - 80);

  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("OFFICIAL CASH DRAWER AUDIT SLIP (VERSO COVER)", canvas.width / 2, canvas.height / 2 - 30);

  ctx.font = "bold 18px monospace";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText(`BATCH AUDIT ID: ${batchId} • DUPLEX PAGE PAIR 1 (AUDIT ONLY)`, canvas.width / 2, canvas.height / 2 + 30);

  ctx.font = "italic 16px sans-serif";
  ctx.fillText("This side intentionally serves as the back cover of the audit slip for two-sided duplex printing alignment.", canvas.width / 2, canvas.height / 2 + 80);
};
