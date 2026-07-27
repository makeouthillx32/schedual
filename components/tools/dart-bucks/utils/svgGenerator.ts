import { DartBuckConfig, DENOMINATIONS, DenomArtSlot } from "../types";
import { getSerialString, MONTH_NAMES_FULL } from "./security";

export interface MonthPalette {
  name: string;
  denoms: Record<string, { bg: string; border: string; circleBg: string; text: string; innerTint: string }>;
}

// Complete 12-Month Monopoly Color Palette Engine
export const MONTHLY_PALETTES: Record<number, MonthPalette> = {
  0: { // January - Midnight Frost
    name: "January Midnight Frost",
    denoms: {
      "1": { bg: "transparent", border: "#1e293b", circleBg: "rgba(248, 250, 252, 0.92)", text: "#0f172a", innerTint: "rgba(30, 41, 59, 0.15)" },
      "5": { bg: "transparent", border: "#0369a1", circleBg: "rgba(224, 242, 254, 0.92)", text: "#0c4a6e", innerTint: "rgba(3, 105, 161, 0.18)" },
      "10": { bg: "transparent", border: "#0f172a", circleBg: "rgba(186, 230, 253, 0.92)", text: "#0369a1", innerTint: "rgba(15, 23, 42, 0.20)" },
      "20": { bg: "transparent", border: "#064e3b", circleBg: "rgba(167, 243, 208, 0.92)", text: "#022c22", innerTint: "rgba(6, 78, 59, 0.18)" },
    },
  },
  1: { // February - Valentine Rose
    name: "February Valentine Rose",
    denoms: {
      "1": { bg: "transparent", border: "#4c0519", circleBg: "rgba(255, 255, 255, 0.92)", text: "#4c0519", innerTint: "rgba(76, 5, 25, 0.15)" },
      "5": { bg: "transparent", border: "#831843", circleBg: "rgba(251, 207, 232, 0.92)", text: "#500724", innerTint: "rgba(131, 24, 67, 0.18)" },
      "10": { bg: "transparent", border: "#881337", circleBg: "rgba(254, 205, 211, 0.92)", text: "#4c0519", innerTint: "rgba(136, 19, 55, 0.20)" },
      "20": { bg: "transparent", border: "#581c87", circleBg: "rgba(233, 213, 255, 0.92)", text: "#3b0764", innerTint: "rgba(88, 28, 135, 0.18)" },
    },
  },
  2: { // March - St. Patrick Shamrock Emerald
    name: "March Shamrock Emerald",
    denoms: {
      "1": { bg: "transparent", border: "#14532d", circleBg: "rgba(240, 253, 244, 0.92)", text: "#052e16", innerTint: "rgba(20, 83, 45, 0.15)" },
      "5": { bg: "transparent", border: "#3f6212", circleBg: "rgba(236, 252, 203, 0.92)", text: "#1a2e05", innerTint: "rgba(63, 98, 18, 0.18)" },
      "10": { bg: "transparent", border: "#78350f", circleBg: "rgba(254, 243, 199, 0.92)", text: "#451a03", innerTint: "rgba(120, 53, 15, 0.20)" },
      "20": { bg: "transparent", border: "#064e3b", circleBg: "rgba(209, 250, 229, 0.92)", text: "#022c22", innerTint: "rgba(6, 78, 59, 0.18)" },
    },
  },
  3: { // April - Spring Bloom Pastel
    name: "April Spring Bloom",
    denoms: {
      "1": { bg: "transparent", border: "#334155", circleBg: "rgba(248, 250, 252, 0.92)", text: "#0f172a", innerTint: "rgba(51, 65, 85, 0.15)" },
      "5": { bg: "transparent", border: "#701a75", circleBg: "rgba(251, 207, 232, 0.92)", text: "#4a044e", innerTint: "rgba(112, 26, 117, 0.18)" },
      "10": { bg: "transparent", border: "#713f12", circleBg: "rgba(254, 249, 195, 0.92)", text: "#365314", innerTint: "rgba(113, 63, 18, 0.20)" },
      "20": { bg: "transparent", border: "#14532d", circleBg: "rgba(220, 252, 231, 0.92)", text: "#052e16", innerTint: "rgba(20, 83, 45, 0.18)" },
    },
  },
  4: { // May - Solar Bloom & Gold
    name: "May Solar Gold",
    denoms: {
      "1": { bg: "transparent", border: "#78350f", circleBg: "rgba(255, 255, 255, 0.92)", text: "#451a03", innerTint: "rgba(120, 53, 15, 0.15)" },
      "5": { bg: "transparent", border: "#7c2d12", circleBg: "rgba(255, 237, 213, 0.92)", text: "#431407", innerTint: "rgba(124, 45, 18, 0.18)" },
      "10": { bg: "transparent", border: "#451a03", circleBg: "rgba(254, 240, 138, 0.92)", text: "#3b1e06", innerTint: "rgba(69, 26, 3, 0.20)" },
      "20": { bg: "transparent", border: "#064e3b", circleBg: "rgba(187, 247, 208, 0.92)", text: "#022c22", innerTint: "rgba(6, 78, 59, 0.18)" },
    },
  },
  5: { // June - Ocean Cyan Breeze
    name: "June Ocean Cyan Breeze",
    denoms: {
      "1": { bg: "transparent", border: "#0f172a", circleBg: "rgba(240, 249, 255, 0.92)", text: "#0c4a6e", innerTint: "rgba(15, 23, 42, 0.15)" },
      "5": { bg: "transparent", border: "#881337", circleBg: "rgba(255, 228, 230, 0.92)", text: "#4c0519", innerTint: "rgba(136, 19, 55, 0.18)" },
      "10": { bg: "transparent", border: "#164e63", circleBg: "rgba(207, 250, 254, 0.92)", text: "#083344", innerTint: "rgba(22, 78, 99, 0.20)" },
      "20": { bg: "transparent", border: "#115e59", circleBg: "rgba(204, 251, 241, 0.92)", text: "#042f2e", innerTint: "rgba(17, 94, 89, 0.18)" },
    },
  },
  6: { // July - Classic Monopoly Photo Match (Default)
    name: "July Classic Monopoly Match",
    denoms: {
      "1": { bg: "transparent", border: "#27272a", circleBg: "rgba(248, 250, 252, 0.94)", text: "#09090b", innerTint: "rgba(39, 39, 42, 0.15)" },
      "5": { bg: "transparent", border: "#831843", circleBg: "rgba(251, 207, 232, 0.94)", text: "#500724", innerTint: "rgba(131, 24, 67, 0.18)" },
      "10": { bg: "transparent", border: "#713f12", circleBg: "rgba(254, 240, 138, 0.94)", text: "#365314", innerTint: "rgba(113, 63, 18, 0.20)" },
      "20": { bg: "transparent", border: "#064e3b", circleBg: "rgba(187, 247, 208, 0.94)", text: "#022c22", innerTint: "rgba(6, 78, 59, 0.18)" },
    },
  },
  7: { // August - Solar Blaze Sunset
    name: "August Solar Blaze Sunset",
    denoms: {
      "1": { bg: "transparent", border: "#713f12", circleBg: "rgba(255, 255, 255, 0.92)", text: "#451a03", innerTint: "rgba(113, 63, 18, 0.15)" },
      "5": { bg: "transparent", border: "#7c2d12", circleBg: "rgba(255, 237, 213, 0.92)", text: "#431407", innerTint: "rgba(124, 45, 18, 0.18)" },
      "10": { bg: "transparent", border: "#713f12", circleBg: "rgba(254, 240, 138, 0.92)", text: "#3b1e06", innerTint: "rgba(113, 63, 18, 0.20)" },
      "20": { bg: "transparent", border: "#14532d", circleBg: "rgba(187, 247, 208, 0.92)", text: "#052e16", innerTint: "rgba(20, 83, 45, 0.18)" },
    },
  },
  8: { // September - Autumn Copper
    name: "September Autumn Copper",
    denoms: {
      "1": { bg: "transparent", border: "#7c2d12", circleBg: "rgba(255, 255, 255, 0.92)", text: "#431407", innerTint: "rgba(124, 45, 18, 0.15)" },
      "5": { bg: "transparent", border: "#881337", circleBg: "rgba(255, 228, 230, 0.92)", text: "#4c0519", innerTint: "rgba(136, 19, 55, 0.18)" },
      "10": { bg: "transparent", border: "#7c2d12", circleBg: "rgba(255, 237, 213, 0.92)", text: "#431407", innerTint: "rgba(124, 45, 18, 0.20)" },
      "20": { bg: "transparent", border: "#365314", circleBg: "rgba(236, 252, 203, 0.92)", text: "#1a2e05", innerTint: "rgba(54, 83, 20, 0.18)" },
    },
  },
  9: { // October - Pumpkin & Purple Halloween
    name: "October Pumpkin & Purple",
    denoms: {
      "1": { bg: "transparent", border: "#18181b", circleBg: "rgba(244, 244, 245, 0.92)", text: "#09090b", innerTint: "rgba(24, 24, 27, 0.18)" },
      "5": { bg: "transparent", border: "#581c87", circleBg: "rgba(243, 232, 255, 0.92)", text: "#3b0764", innerTint: "rgba(88, 28, 135, 0.18)" },
      "10": { bg: "transparent", border: "#1c1917", circleBg: "rgba(255, 237, 213, 0.92)", text: "#431407", innerTint: "rgba(28, 25, 23, 0.22)" },
      "20": { bg: "transparent", border: "#052e16", circleBg: "rgba(187, 247, 208, 0.92)", text: "#022c22", innerTint: "rgba(5, 46, 22, 0.18)" },
    },
  },
  10: { // November - Harvest Wine & Walnut
    name: "November Harvest Wine & Walnut",
    denoms: {
      "1": { bg: "transparent", border: "#451a03", circleBg: "rgba(255, 255, 255, 0.92)", text: "#431407", innerTint: "rgba(69, 26, 3, 0.15)" },
      "5": { bg: "transparent", border: "#4c0519", circleBg: "rgba(255, 228, 230, 0.92)", text: "#4c0519", innerTint: "rgba(76, 5, 25, 0.18)" },
      "10": { bg: "transparent", border: "#451a03", circleBg: "rgba(254, 243, 199, 0.92)", text: "#451a03", innerTint: "rgba(69, 26, 3, 0.20)" },
      "20": { bg: "transparent", border: "#052e16", circleBg: "rgba(220, 252, 231, 0.92)", text: "#022c22", innerTint: "rgba(5, 46, 22, 0.18)" },
    },
  },
  11: { // December - Holiday Holly & Evergreen
    name: "December Holiday Holly & Gold",
    denoms: {
      "1": { bg: "transparent", border: "#166534", circleBg: "rgba(240, 253, 244, 0.92)", text: "#052e16", innerTint: "rgba(22, 101, 52, 0.15)" },
      "5": { bg: "transparent", border: "#7f1d1d", circleBg: "rgba(254, 226, 226, 0.92)", text: "#450a0a", innerTint: "rgba(127, 29, 29, 0.18)" },
      "10": { bg: "transparent", border: "#713f12", circleBg: "rgba(254, 240, 138, 0.92)", text: "#365314", innerTint: "rgba(113, 63, 18, 0.20)" },
      "20": { bg: "transparent", border: "#052e16", circleBg: "rgba(187, 247, 208, 0.92)", text: "#022c22", innerTint: "rgba(5, 46, 22, 0.18)" },
    },
  },
};

// DESTRUCTIVE SHRED DEPARTMENT COLOR VARIANT (When validityMode === "expires")
export const DESTRUCTIVE_SHRED_COLORS: Record<string, { bg: string; border: string; circleBg: string; text: string; innerTint: string }> = {
  "1": { bg: "transparent", border: "#991b1b", circleBg: "rgba(254, 226, 226, 0.95)", text: "#7f1d1d", innerTint: "rgba(153, 27, 27, 0.25)" },
  "5": { bg: "transparent", border: "#991b1b", circleBg: "rgba(254, 205, 211, 0.95)", text: "#881337", innerTint: "rgba(153, 27, 27, 0.25)" },
  "10": { bg: "transparent", border: "#78350f", circleBg: "rgba(254, 243, 199, 0.95)", text: "#713f12", innerTint: "rgba(120, 53, 15, 0.25)" },
  "20": { bg: "transparent", border: "#991b1b", circleBg: "rgba(254, 226, 226, 0.95)", text: "#7f1d1d", innerTint: "rgba(153, 27, 27, 0.25)" },
};

export const generateDartBuckSVG = (
  serialNum: number,
  config: DartBuckConfig,
  denomSlots: Record<string, DenomArtSlot> = {},
  denomValue = config.denomination,
  width = 1200,
  height = 600
): string => {
  const now = new Date();
  const monthIdx = typeof config.monthOverride === "number" ? config.monthOverride : now.getMonth();

  // Smart Palette Selection: Destructive Variant vs Monthly Theme
  const isDestructive = config.validityMode === "expires";
  const activePalette = MONTHLY_PALETTES[monthIdx] || MONTHLY_PALETTES[6];

  const photoColor = isDestructive
    ? DESTRUCTIVE_SHRED_COLORS[denomValue] || DESTRUCTIVE_SHRED_COLORS["1"]
    : activePalette.denoms[denomValue] || activePalette.denoms["1"];

  const serialStr = getSerialString(config.stationPrefix, config.batchId, serialNum, config.digits, config.includeChecksum);
  const currentMonthYearStr = `${MONTH_NAMES_FULL[monthIdx].toUpperCase()} ${now.getFullYear()}`;

  const finePrintNotice = isDestructive
    ? `MUST BE DESTROYED BY DART SHRED DEPT ON: ${config.expirationDate || "END OF MONTH"} • BATCH: ${config.batchId}`
    : `VALID FOREVER ∞ • ISSUED: ${currentMonthYearStr} • BATCH: ${config.batchId}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}px" height="${height}px">
  <defs>
    <!-- 3D Vector Drop Shadow Filter for Display Text -->
    <filter id="text-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3.5" dy="3.5" stdDeviation="2" flood-color="#000000" flood-opacity="0.45"/>
    </filter>

    <!-- Ornate Guilloche Squiggle Pattern for Big Numerals -->
    <pattern id="number-squiggle" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
      <path d="M 0 6 Q 3 0, 6 6 T 12 6" fill="none" stroke="${photoColor.border}" stroke-width="1.2" stroke-opacity="0.5"/>
      <path d="M 0 6 Q 3 12, 6 6 T 12 6" fill="none" stroke="${photoColor.border}" stroke-width="1.2" stroke-opacity="0.5"/>
    </pattern>

    <!-- Hatch Mesh Border Pattern -->
    <pattern id="border-hatch" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 0 10 L 10 0 M -2 2 L 2 -2 M 8 12 L 12 8" stroke="${photoColor.border}" stroke-width="1" stroke-opacity="0.45"/>
    </pattern>

    <!-- Ornate Corner Filigree Scroll Vignette -->
    <g id="fancy-scroll">
      <path d="M 0 0 C 20 -15, 40 -8, 45 12 C 50 32, 25 45, 12 32 C 0 20, 25 8, 32 16" fill="none" stroke="${photoColor.border}" stroke-width="2.5"/>
      <circle cx="32" cy="16" r="3" fill="${photoColor.border}"/>
    </g>
  </defs>

  <!-- Transparent Background Base (Allows Physical Paper Color to Shine Through 100%) -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="none"/>

  ${config.showPresetBorders ? `
  <!-- Concentric Outer & Inner Monopoly Borders (Background Paper Shining Through) -->
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

  <!-- Left Side Panel (DART Crest Box with Vector Box Border, Stroke, & 3D Shadow) -->
  <g transform="translate(90, ${height / 2 - 50})">
    <rect x="0" y="0" width="140" height="100" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="4"/>
    <text x="70" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="28" fill="${photoColor.text}" stroke="${photoColor.border}" stroke-width="1.6" stroke-linejoin="round" filter="url(#text-drop-shadow)" text-anchor="middle">DART</text>
    <line x1="20" y1="56" x2="120" y2="56" stroke="${photoColor.border}" stroke-width="2"/>
    <text x="70" y="74" font-family="sans-serif" font-weight="extrabold" font-size="11" fill="${photoColor.border}" stroke="${photoColor.border}" stroke-width="0.4" text-anchor="middle">EST. 1962</text>
  </g>

  <!-- Right Side Panel (DART House/Facility Icon Box with Vector Box Border) -->
  <g transform="translate(${width - 230}, ${height / 2 - 50})">
    <rect x="0" y="0" width="140" height="100" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="4"/>
    <!-- Monopoly House / Facility Roof Icon -->
    <path d="M 70 20 L 25 55 L 38 55 L 38 82 L 102 82 L 102 55 L 115 55 Z" fill="${photoColor.border}"/>
    <rect x="56" y="60" width="28" height="22" fill="${photoColor.circleBg}"/>
  </g>

  <!-- 4 Corner Rectangular Denomination Boxes (Featuring Outer Box Border, Vector Text Stroke, Squiggles & 3D Drop Shadow) -->
  <!-- Top-Left Box -->
  <g transform="translate(80, 70)">
    <rect x="0" y="0" width="110" height="60" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="3"/>
    <text x="55" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="42" fill="${photoColor.text}" stroke="${photoColor.border}" stroke-width="2.2" stroke-linejoin="round" filter="url(#text-drop-shadow)" text-anchor="middle">${denomValue}</text>
  </g>

  <!-- Top-Right Box -->
  <g transform="translate(${width - 190}, 70)">
    <rect x="0" y="0" width="110" height="60" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="3"/>
    <text x="55" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="42" fill="${photoColor.text}" stroke="${photoColor.border}" stroke-width="2.2" stroke-linejoin="round" filter="url(#text-drop-shadow)" text-anchor="middle">${denomValue}</text>
  </g>

  <!-- Bottom-Left Box -->
  <g transform="translate(80, ${height - 130})">
    <rect x="0" y="0" width="110" height="60" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="3"/>
    <text x="55" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="42" fill="${photoColor.text}" stroke="${photoColor.border}" stroke-width="2.2" stroke-linejoin="round" filter="url(#text-drop-shadow)" text-anchor="middle">${denomValue}</text>
  </g>

  <!-- Bottom-Right Box -->
  <g transform="translate(${width - 190}, ${height - 130})">
    <rect x="0" y="0" width="110" height="60" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="3"/>
    <text x="55" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="42" fill="${photoColor.text}" stroke="${photoColor.border}" stroke-width="2.2" stroke-linejoin="round" filter="url(#text-drop-shadow)" text-anchor="middle">${denomValue}</text>
  </g>
  ` : ""}

  ${config.showPresetText ? `
  <!-- Classic Monopoly Center Circle -->
  <g transform="translate(${width / 2}, ${height / 2})">
    <circle cx="0" cy="0" r="180" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="8"/>
    <circle cx="0" cy="0" r="168" fill="none" stroke="${photoColor.border}" stroke-width="2" stroke-dasharray="8,4"/>

    <!-- Giant Center Denomination (Giant Numerals with Ornate Guilloche Squiggles, Outer Vector Stroke Border, & 3D Shadow) -->
    <text font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="170" fill="${photoColor.text}" stroke="${photoColor.border}" stroke-width="3.8" stroke-linejoin="round" filter="url(#text-drop-shadow)" text-anchor="middle" y="58">${denomValue}</text>
    <text font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="170" fill="url(#number-squiggle)" text-anchor="middle" y="58">${denomValue}</text>

    <!-- Curved Text "DART BUCKS®" Along Bottom Inner Rim (Featuring Stroke & Drop Shadow) -->
    <text font-family="sans-serif" font-weight="900" font-size="16" fill="${photoColor.border}" stroke="${photoColor.border}" stroke-width="0.6" filter="url(#text-drop-shadow)" letter-spacing="4" text-anchor="middle" y="145">• DART BUCKS ® •</text>
  </g>
  ` : ""}

  <!-- Transparent Serial Box Overlay with Box Border & Text Drop Shadow -->
  <g transform="translate(${width / 2 - 280}, ${height - 65})">
    <rect x="0" y="0" width="560" height="42" fill="#ffffff" fill-opacity="0.95" stroke="${photoColor.border}" stroke-width="2.5" rx="5"/>
    <text x="280" y="28" font-family="monospace" font-weight="bold" font-size="24" fill="${isDestructive ? '#dc2626' : '#b91c1c'}" stroke="${isDestructive ? '#991b1b' : '#991b1b'}" stroke-width="1.0" stroke-linejoin="round" filter="url(#text-drop-shadow)" text-anchor="middle">${serialStr}</text>
  </g>

  <!-- Hardcoded Fine Print Notice (Crisp Fine Lines for High Legibility) -->
  <text x="45" y="${height - 24}" font-family="sans-serif" font-size="10" font-weight="bold" fill="${photoColor.border}" stroke="${photoColor.border}" stroke-width="0.2" fill-opacity="0.95">${finePrintNotice}</text>
</svg>`;
};
