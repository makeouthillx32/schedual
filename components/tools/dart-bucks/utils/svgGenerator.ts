import { DartBuckConfig, DENOMINATIONS, DenomArtSlot } from "../types";
import { getSerialString, isLightBg, MONTH_NAMES_FULL } from "./security";

// Exact Monopoly Bank Photo Color Palettes
export const MONOPOLY_PHOTO_COLORS: Record<string, { bg: string; border: string; circleBg: string; text: string; innerBorder: string }> = {
  "1": { bg: "#e2e8f0", border: "#334155", circleBg: "#ffffff", text: "#0f172a", innerBorder: "#1e293b" },
  "5": { bg: "#f472b6", border: "#701a75", circleBg: "#fbcfe8", text: "#4c0519", innerBorder: "#86198f" },
  "10": { bg: "#facc15", border: "#583101", circleBg: "#fef08a", text: "#3b1e06", innerBorder: "#78350f" },
  "20": { bg: "#4ade80", border: "#064e3b", circleBg: "#bbf7d0", text: "#022c22", innerBorder: "#047857" },
};

export const generateDartBuckSVG = (
  serialNum: number,
  config: DartBuckConfig,
  denomSlots: Record<string, DenomArtSlot>,
  denomValue = config.denomination,
  width = 1200,
  height = 469
): string => {
  const photoColor = MONOPOLY_PHOTO_COLORS[denomValue] || MONOPOLY_PHOTO_COLORS["1"];
  const serialStr = getSerialString(config.stationPrefix, config.batchId, serialNum, config.digits, config.includeChecksum);
  const slot = denomSlots[denomValue];

  const now = new Date();
  const currentMonthYearStr = `${MONTH_NAMES_FULL[now.getMonth()].toUpperCase()} ${now.getFullYear()}`;

  const customImgSvg = slot && slot.image_url
    ? `<image href="${slot.image_url}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none"/>`
    : "";

  const finePrintNotice = config.validityMode === "expires"
    ? `MUST BE DESTROYED BY DART SHRED DEPT ON: ${config.expirationDate || "END OF MONTH"} • BATCH: ${config.batchId}`
    : `VALID FOREVER ∞ • ISSUED: ${currentMonthYearStr} • BATCH: ${config.batchId}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}px" height="${height}px">
  <defs>
    <!-- Paper Texture Overlay -->
    <pattern id="white-texture-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.8" fill="#ffffff" fill-opacity="0.3"/>
      <circle cx="12" cy="8" r="0.6" fill="#ffffff" fill-opacity="0.2"/>
      <circle cx="6" cy="16" r="0.9" fill="#ffffff" fill-opacity="0.25"/>
    </pattern>

    <!-- Curved Text Path for Bottom Circle -->
    <path id="monopoly-circle-curve" d="M -120 40 A 130 130 0 0 0 120 40"/>
  </defs>

  <!-- Background Base (Exact Monopoly Paper Color) -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="${photoColor.bg}"/>

  ${customImgSvg}

  <!-- Texture Overlay -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#white-texture-dots)"/>

  ${config.showPresetBorders ? `
  <!-- Outer Double Line Monopoly Border -->
  <rect x="18" y="18" width="${width - 36}" height="${height - 36}" fill="none" stroke="${photoColor.border}" stroke-width="8"/>
  <rect x="32" y="32" width="${width - 64}" height="${height - 64}" fill="none" stroke="${photoColor.border}" stroke-width="2.5"/>

  <!-- Left Side Rectangular Box (DART Crest Icon) -->
  <g transform="translate(70, ${height / 2 - 40})">
    <rect x="0" y="0" width="130" height="80" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="3" rx="2"/>
    <text x="65" y="36" font-family="sans-serif" font-weight="extrabold" font-size="22" fill="${photoColor.text}" text-anchor="middle">DART</text>
    <text x="65" y="56" font-family="sans-serif" font-weight="bold" font-size="9" fill="${photoColor.border}" text-anchor="middle">EST. 1962</text>
  </g>

  <!-- Right Side Rectangular Box (DART House/Facility Icon) -->
  <g transform="translate(${width - 200}, ${height / 2 - 40})">
    <rect x="0" y="0" width="130" height="80" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="3" rx="2"/>
    <!-- House / Roof Icon -->
    <path d="M 65 18 L 25 45 L 35 45 L 35 65 L 95 65 L 95 45 L 105 45 Z" fill="${photoColor.border}"/>
    <rect x="52" y="48" width="26" height="17" fill="${photoColor.circleBg}"/>
  </g>

  <!-- 4 Corner Rectangular Denomination Boxes (Matching Photo) -->
  <!-- Top-Left Box -->
  <g transform="translate(60, 48)">
    <rect x="0" y="0" width="100" height="50" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="3"/>
    <text x="50" y="36" font-family="serif" font-weight="bold" font-size="34" fill="${photoColor.text}" text-anchor="middle">${denomValue}</text>
  </g>

  <!-- Top-Right Box -->
  <g transform="translate(${width - 160}, 48)">
    <rect x="0" y="0" width="100" height="50" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="3"/>
    <text x="50" y="36" font-family="serif" font-weight="bold" font-size="34" fill="${photoColor.text}" text-anchor="middle">${denomValue}</text>
  </g>

  <!-- Bottom-Left Box -->
  <g transform="translate(60, ${height - 98})">
    <rect x="0" y="0" width="100" height="50" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="3"/>
    <text x="50" y="36" font-family="serif" font-weight="bold" font-size="34" fill="${photoColor.text}" text-anchor="middle">${denomValue}</text>
  </g>

  <!-- Bottom-Right Box -->
  <g transform="translate(${width - 160}, ${height - 98})">
    <rect x="0" y="0" width="100" height="50" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="3"/>
    <text x="50" y="36" font-family="serif" font-weight="bold" font-size="34" fill="${photoColor.text}" text-anchor="middle">${denomValue}</text>
  </g>
  ` : ""}

  ${config.showPresetText ? `
  <!-- Classic Monopoly Center Circle -->
  <g transform="translate(${width / 2}, ${height / 2})">
    <circle cx="0" cy="0" r="145" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="6"/>
    <circle cx="0" cy="0" r="135" fill="none" stroke="${photoColor.border}" stroke-width="1.5" stroke-dasharray="6,3"/>

    <!-- Giant Center Denomination Number -->
    <text font-family="sans-serif" font-weight="900" font-size="140" fill="${photoColor.text}" text-anchor="middle" y="48">${denomValue}</text>

    <!-- Curved "DART BUCKS®" Text Along Bottom Inner Rim -->
    <text font-family="sans-serif" font-weight="extrabold" font-size="14" fill="${photoColor.border}" letter-spacing="3" text-anchor="middle" y="115">• DART BUCKS ® •</text>
  </g>
  ` : ""}

  <!-- Transparent Serial Box Overlay -->
  <g transform="translate(${width / 2 - 260}, ${height - 54})">
    <rect x="0" y="0" width="520" height="38" fill="#ffffff" fill-opacity="0.94" stroke="${photoColor.border}" stroke-width="2" rx="4"/>
    <text x="260" y="26" font-family="monospace" font-weight="bold" font-size="22" fill="#b91c1c" text-anchor="middle">${serialStr}</text>
  </g>

  <!-- Hardcoded Fine Print Notice -->
  <text x="35" y="${height - 20}" font-family="sans-serif" font-size="10" font-weight="bold" fill="${photoColor.border}" fill-opacity="0.85">${finePrintNotice}</text>
</svg>`;
};
