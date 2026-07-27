import { DartBuckConfig, DENOMINATIONS, DenomArtSlot, PAPER_SPECS, PaperSpec } from "../types";
import { getSerialString, isLightBg } from "./security";

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

export const drawDartLogoInCircle = (
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

export const drawCurvedText = (
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

export const drawTextOverlay = (
  ctx: CanvasRenderingContext2D,
  serialStr: string,
  width: number,
  height: number,
  position: "bottom" | "top" | "bottom-right" = "bottom"
) => {
  let boxX = width / 2 - 280;
  let boxY = height - 60;

  if (position === "top") {
    boxY = 15;
  } else if (position === "bottom-right") {
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

// Render DartBuck FRONT side
export const renderDartBuckOnCanvas = (
  canvas: HTMLCanvasElement,
  serialNum: number,
  config: DartBuckConfig,
  denomSlots: Record<string, DenomArtSlot>,
  loadedSlotImages: Record<string, HTMLImageElement>,
  watermarkLightImg: HTMLImageElement | null,
  watermarkDarkImg: HTMLImageElement | null,
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
  const serialStr = getSerialString(config.stationPrefix, config.batchId, serialNum, config.digits, config.includeChecksum);

  if (slot && slot.image_url && slotImg) {
    ctx.drawImage(slotImg, 0, 0, width, height);

    const wm = getContrastWatermark("#ffffff", config.watermarkMode, config.showWatermark, watermarkLightImg, watermarkDarkImg);
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

    drawTextOverlay(ctx, serialStr, width, height, config.serialPosition);
    return;
  }

  // Monopoly Theme
  ctx.fillStyle = style.bg;
  ctx.fillRect(0, 0, width, height);

  const wm = getContrastWatermark(style.bg, config.watermarkMode, config.showWatermark, watermarkLightImg, watermarkDarkImg);
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

    drawCurvedText(ctx, "DART BUCKS", ovalCx, ovalCy + 25, 130, -Math.PI * 0.78, -Math.PI * 0.22, "#000000");

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

  drawTextOverlay(ctx, serialStr, width, height, config.serialPosition);
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

  const wm = getContrastWatermark(style.circleBg, config.watermarkMode, config.showWatermark, watermarkLightImg, watermarkDarkImg);
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

  const serialStr = getSerialString(config.stationPrefix, config.batchId, serialNum, config.digits, config.includeChecksum);
  ctx.font = "bold 20px monospace";
  ctx.fillStyle = "#0f172a";
  ctx.textAlign = "right";
  ctx.fillText(serialStr, width - 45, height - 40);
};

// Draw Hairline Vector Crop Marks (Registration Black K=100%) in jsPDF
export const drawPdfCropMarks = (
  doc: any,
  x: number,
  y: number,
  w: number,
  h: number,
  bleedOffset = 3,
  markLength = 4
) => {
  doc.setDrawColor(0, 0, 0); // Registration Black
  doc.setLineWidth(0.1);     // Hairline ~0.25 pt

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
