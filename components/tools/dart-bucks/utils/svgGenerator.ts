import { DartBuckConfig, DENOMINATIONS, DenomArtSlot } from "../types";
import { getSerialString, MONTH_NAMES_FULL } from "./security";

// Exact Monopoly Bank Photo Color Palettes (Rich Contrast)
export const MONOPOLY_PHOTO_COLORS: Record<string, { bg: string; border: string; circleBg: string; text: string; innerTint: string }> = {
  "1": { bg: "#ffffff", border: "#27272a", circleBg: "#f8fafc", text: "#09090b", innerTint: "rgba(39, 39, 42, 0.18)" },
  "5": { bg: "#f472b6", border: "#831843", circleBg: "#fbcfe8", text: "#500724", innerTint: "rgba(131, 24, 67, 0.20)" },
  "10": { bg: "#facc15", border: "#713f12", circleBg: "#fef08a", text: "#365314", innerTint: "rgba(113, 63, 18, 0.22)" },
  "20": { bg: "#4ade80", border: "#064e3b", circleBg: "#bbf7d0", text: "#022c22", innerTint: "rgba(6, 78, 59, 0.20)" },
};

// Exact Classic Monopoly Dimensions: 4.0" x 2.0" (1200px x 600px - 2:1 Aspect Ratio)
export const generateDartBuckSVG = (
  serialNum: number,
  config: DartBuckConfig,
  denomSlots: Record<string, DenomArtSlot>,
  denomValue = config.denomination,
  width = 1200,
  height = 600
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
    <!-- Paper Fiber Texture Overlay -->
    <pattern id="monopoly-paper-texture" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="0.9" fill="#ffffff" fill-opacity="0.35"/>
      <circle cx="18" cy="12" r="0.7" fill="#ffffff" fill-opacity="0.25"/>
      <circle cx="9" cy="24" r="0.8" fill="#ffffff" fill-opacity="0.3"/>
      <circle cx="27" cy="21" r="0.6" fill="#ffffff" fill-opacity="0.2"/>
    </pattern>

    <!-- Hatch Mesh Border Pattern -->
    <pattern id="border-hatch" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 0 10 L 10 0 M -2 2 L 2 -2 M 8 12 L 12 8" stroke="${photoColor.border}" stroke-width="1" stroke-opacity="0.4"/>
    </pattern>

    <!-- Fancy Ornate Scroll Vignette -->
    <g id="fancy-scroll">
      <path d="M 0 0 C 20 -15, 40 -8, 45 12 C 50 32, 25 45, 12 32 C 0 20, 25 8, 32 16" fill="none" stroke="${photoColor.border}" stroke-width="2.5"/>
      <circle cx="32" cy="16" r="3" fill="${photoColor.border}"/>
    </g>
  </defs>

  <!-- Background Base (Rich Monopoly Paper Color) -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="${photoColor.bg}"/>

  ${customImgSvg}

  <!-- Paper Texture Overlay -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#monopoly-paper-texture)"/>

  ${config.showPresetBorders ? `
  <!-- Concentric Outer & Inner Monopoly Borders (Multiple Borders With Background Shining Through) -->
  <!-- 1. Outer Solid Thick Border Line -->
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="${photoColor.border}" stroke-width="10"/>

  <!-- 2. Middle Hatched Border Frame -->
  <rect x="36" y="36" width="${width - 72}" height="${height - 72}" fill="url(#border-hatch)" stroke="${photoColor.border}" stroke-width="2"/>

  <!-- 3. Inner Decorative Dashed Border Line -->
  <rect x="52" y="52" width="${width - 104}" height="${height - 104}" fill="${photoColor.innerTint}" stroke="${photoColor.border}" stroke-width="2.5" stroke-dasharray="10,5"/>

  <!-- Ornate Corner Filigree Scrolls -->
  <use href="#fancy-scroll" x="65" y="65"/>
  <use href="#fancy-scroll" x="${width - 65}" y="65" transform="scale(-1, 1) translate(${-width + 130}, 0)"/>
  <use href="#fancy-scroll" x="65" y="${height - 65}" transform="scale(1, -1) translate(0, ${-height + 130})"/>
  <use href="#fancy-scroll" x="${width - 65}" y="${height - 65}" transform="scale(-1, -1) translate(${-width + 130}, ${-height + 130})"/>

  <!-- Left Side Panel (DART Crest Box) -->
  <g transform="translate(90, ${height / 2 - 50})">
    <rect x="0" y="0" width="140" height="100" fill="${photoColor.circleBg}" fill-opacity="0.95" stroke="${photoColor.border}" stroke-width="4" rx="4"/>
    <text x="70" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="28" fill="${photoColor.text}" text-anchor="middle">DART</text>
    <line x1="20" y1="56" x2="120" y2="56" stroke="${photoColor.border}" stroke-width="2"/>
    <text x="70" y="74" font-family="sans-serif" font-weight="bold" font-size="11" fill="${photoColor.border}" text-anchor="middle">EST. 1962</text>
  </g>

  <!-- Right Side Panel (DART House/Facility Icon Box) -->
  <g transform="translate(${width - 230}, ${height / 2 - 50})">
    <rect x="0" y="0" width="140" height="100" fill="${photoColor.circleBg}" fill-opacity="0.95" stroke="${photoColor.border}" stroke-width="4" rx="4"/>
    <!-- Monopoly House / Facility Roof Icon -->
    <path d="M 70 20 L 25 55 L 38 55 L 38 82 L 102 82 L 102 55 L 115 55 Z" fill="${photoColor.border}"/>
    <rect x="56" y="60" width="28" height="22" fill="${photoColor.circleBg}"/>
  </g>

  <!-- 4 Corner Rectangular Denomination Boxes (Matching Reference Photo) -->
  <!-- Top-Left Box -->
  <g transform="translate(80, 70)">
    <rect x="0" y="0" width="110" height="60" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="3"/>
    <text x="55" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="42" fill="${photoColor.text}" text-anchor="middle">${denomValue}</text>
  </g>

  <!-- Top-Right Box -->
  <g transform="translate(${width - 190}, 70)">
    <rect x="0" y="0" width="110" height="60" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="3"/>
    <text x="55" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="42" fill="${photoColor.text}" text-anchor="middle">${denomValue}</text>
  </g>

  <!-- Bottom-Left Box -->
  <g transform="translate(80, ${height - 130})">
    <rect x="0" y="0" width="110" height="60" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="3"/>
    <text x="55" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="42" fill="${photoColor.text}" text-anchor="middle">${denomValue}</text>
  </g>

  <!-- Bottom-Right Box -->
  <g transform="translate(${width - 190}, ${height - 130})">
    <rect x="0" y="0" width="110" height="60" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="3"/>
    <text x="55" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="42" fill="${photoColor.text}" text-anchor="middle">${denomValue}</text>
  </g>
  ` : ""}

  ${config.showPresetText ? `
  <!-- Classic Monopoly Center Circle -->
  <g transform="translate(${width / 2}, ${height / 2})">
    <circle cx="0" cy="0" r="180" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="8"/>
    <circle cx="0" cy="0" r="168" fill="none" stroke="${photoColor.border}" stroke-width="2" stroke-dasharray="8,4"/>

    <!-- Giant Center Fancy Serif Denomination Number -->
    <text font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="170" fill="${photoColor.text}" text-anchor="middle" y="58">${denomValue}</text>

    <!-- Curved Text "DART BUCKS®" Along Bottom Inner Rim -->
    <text font-family="sans-serif" font-weight="900" font-size="16" fill="${photoColor.border}" letter-spacing="4" text-anchor="middle" y="145">• DART BUCKS ® •</text>
  </g>
  ` : ""}

  <!-- Transparent Serial Box Overlay with Border -->
  <g transform="translate(${width / 2 - 280}, ${height - 65})">
    <rect x="0" y="0" width="560" height="42" fill="#ffffff" fill-opacity="0.94" stroke="${photoColor.border}" stroke-width="2.5" rx="5"/>
    <text x="280" y="28" font-family="monospace" font-weight="bold" font-size="24" fill="#b91c1c" text-anchor="middle">${serialStr}</text>
  </g>

  <!-- Hardcoded Fine Print Notice -->
  <text x="45" y="${height - 24}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${photoColor.border}" fill-opacity="0.9">${finePrintNotice}</text>
</svg>`;
};
