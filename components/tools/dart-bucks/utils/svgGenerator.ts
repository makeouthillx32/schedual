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
      "1": { bg: "#ffffff", border: "#1e293b", circleBg: "#f8fafc", text: "#0f172a", innerTint: "rgba(30, 41, 59, 0.18)" },
      "5": { bg: "#7dd3fc", border: "#0369a1", circleBg: "#e0f2fe", text: "#0c4a6e", innerTint: "rgba(3, 105, 161, 0.20)" },
      "10": { bg: "#38bdf8", border: "#0f172a", circleBg: "#bae6fd", text: "#0369a1", innerTint: "rgba(15, 23, 42, 0.22)" },
      "20": { bg: "#34d399", border: "#064e3b", circleBg: "#a7f3d0", text: "#022c22", innerTint: "rgba(6, 78, 59, 0.20)" },
    },
  },
  1: { // February - Valentine Rose
    name: "February Valentine Rose",
    denoms: {
      "1": { bg: "#fff1f2", border: "#4c0519", circleBg: "#ffffff", text: "#4c0519", innerTint: "rgba(76, 5, 25, 0.18)" },
      "5": { bg: "#f472b6", border: "#831843", circleBg: "#fbcfe8", text: "#500724", innerTint: "rgba(131, 24, 67, 0.20)" },
      "10": { bg: "#fb7185", border: "#881337", circleBg: "#fecdd3", text: "#4c0519", innerTint: "rgba(136, 19, 55, 0.22)" },
      "20": { bg: "#c084fc", border: "#581c87", circleBg: "#e9d5ff", text: "#3b0764", innerTint: "rgba(88, 28, 135, 0.20)" },
    },
  },
  2: { // March - St. Patrick Shamrock Emerald
    name: "March Shamrock Emerald",
    denoms: {
      "1": { bg: "#ffffff", border: "#14532d", circleBg: "#f0fdf4", text: "#052e16", innerTint: "rgba(20, 83, 45, 0.18)" },
      "5": { bg: "#a3e635", border: "#3f6212", circleBg: "#ecfccb", text: "#1a2e05", innerTint: "rgba(63, 98, 18, 0.20)" },
      "10": { bg: "#fbbf24", border: "#78350f", circleBg: "#fef3c7", text: "#451a03", innerTint: "rgba(120, 53, 15, 0.22)" },
      "20": { bg: "#10b981", border: "#064e3b", circleBg: "#d1fae5", text: "#022c22", innerTint: "rgba(6, 78, 59, 0.20)" },
    },
  },
  3: { // April - Spring Bloom Pastel
    name: "April Spring Bloom",
    denoms: {
      "1": { bg: "#ffffff", border: "#334155", circleBg: "#f8fafc", text: "#0f172a", innerTint: "rgba(51, 65, 85, 0.18)" },
      "5": { bg: "#f472b6", border: "#701a75", circleBg: "#fbcfe8", text: "#4a044e", innerTint: "rgba(112, 26, 117, 0.20)" },
      "10": { bg: "#fde047", border: "#713f12", circleBg: "#fef9c3", text: "#365314", innerTint: "rgba(113, 63, 18, 0.22)" },
      "20": { bg: "#86efac", border: "#14532d", circleBg: "#dcfce7", text: "#052e16", innerTint: "rgba(20, 83, 45, 0.20)" },
    },
  },
  4: { // May - Solar Bloom & Gold
    name: "May Solar Gold",
    denoms: {
      "1": { bg: "#fffbeb", border: "#78350f", circleBg: "#ffffff", text: "#451a03", innerTint: "rgba(120, 53, 15, 0.18)" },
      "5": { bg: "#fb923c", border: "#7c2d12", circleBg: "#ffedd5", text: "#431407", innerTint: "rgba(124, 45, 18, 0.20)" },
      "10": { bg: "#facc15", border: "#451a03", circleBg: "#fef08a", text: "#3b1e06", innerTint: "rgba(69, 26, 3, 0.22)" },
      "20": { bg: "#4ade80", border: "#064e3b", circleBg: "#bbf7d0", text: "#022c22", innerTint: "rgba(6, 78, 59, 0.20)" },
    },
  },
  5: { // June - Ocean Cyan Breeze
    name: "June Ocean Cyan Breeze",
    denoms: {
      "1": { bg: "#ffffff", border: "#0f172a", circleBg: "#f0f9ff", text: "#0c4a6e", innerTint: "rgba(15, 23, 42, 0.18)" },
      "5": { bg: "#fb7185", border: "#881337", circleBg: "#ffe4e6", text: "#4c0519", innerTint: "rgba(136, 19, 55, 0.20)" },
      "10": { bg: "#22d3ee", border: "#164e63", circleBg: "#cffafe", text: "#083344", innerTint: "rgba(22, 78, 99, 0.22)" },
      "20": { bg: "#2dd4bf", border: "#115e59", circleBg: "#ccfbf1", text: "#042f2e", innerTint: "rgba(17, 94, 89, 0.20)" },
    },
  },
  6: { // July - Classic Monopoly Photo Match (Default)
    name: "July Classic Monopoly Match",
    denoms: {
      "1": { bg: "#ffffff", border: "#27272a", circleBg: "#f8fafc", text: "#09090b", innerTint: "rgba(39, 39, 42, 0.18)" },
      "5": { bg: "#f472b6", border: "#831843", circleBg: "#fbcfe8", text: "#500724", innerTint: "rgba(131, 24, 67, 0.20)" },
      "10": { bg: "#facc15", border: "#713f12", circleBg: "#fef08a", text: "#365314", innerTint: "rgba(113, 63, 18, 0.22)" },
      "20": { bg: "#4ade80", border: "#064e3b", circleBg: "#bbf7d0", text: "#022c22", innerTint: "rgba(6, 78, 59, 0.20)" },
    },
  },
  7: { // August - Solar Blaze Sunset
    name: "August Solar Blaze Sunset",
    denoms: {
      "1": { bg: "#fefce8", border: "#713f12", circleBg: "#ffffff", text: "#451a03", innerTint: "rgba(113, 63, 18, 0.18)" },
      "5": { bg: "#f97316", border: "#7c2d12", circleBg: "#ffedd5", text: "#431407", innerTint: "rgba(124, 45, 18, 0.20)" },
      "10": { bg: "#eab308", border: "#713f12", circleBg: "#fef08a", text: "#3b1e06", innerTint: "rgba(113, 63, 18, 0.22)" },
      "20": { bg: "#22c55e", border: "#14532d", circleBg: "#bbf7d0", text: "#052e16", innerTint: "rgba(20, 83, 45, 0.20)" },
    },
  },
  8: { // September - Autumn Copper
    name: "September Autumn Copper",
    denoms: {
      "1": { bg: "#fff7ed", border: "#7c2d12", circleBg: "#ffffff", text: "#431407", innerTint: "rgba(124, 45, 18, 0.18)" },
      "5": { bg: "#f43f5e", border: "#881337", circleBg: "#ffe4e6", text: "#4c0519", innerTint: "rgba(136, 19, 55, 0.20)" },
      "10": { bg: "#f97316", border: "#7c2d12", circleBg: "#ffedd5", text: "#431407", innerTint: "rgba(124, 45, 18, 0.22)" },
      "20": { bg: "#84cc16", border: "#365314", circleBg: "#ecfccb", text: "#1a2e05", innerTint: "rgba(54, 83, 20, 0.20)" },
    },
  },
  9: { // October - Pumpkin & Purple Halloween
    name: "October Pumpkin & Purple",
    denoms: {
      "1": { bg: "#fafafa", border: "#18181b", circleBg: "#f4f4f5", text: "#09090b", innerTint: "rgba(24, 24, 27, 0.20)" },
      "5": { bg: "#c084fc", border: "#581c87", circleBg: "#f3e8ff", text: "#3b0764", innerTint: "rgba(88, 28, 135, 0.20)" },
      "10": { bg: "#fb923c", border: "#1c1917", circleBg: "#ffedd5", text: "#431407", innerTint: "rgba(28, 25, 23, 0.24)" },
      "20": { bg: "#4ade80", border: "#052e16", circleBg: "#bbf7d0", text: "#022c22", innerTint: "rgba(5, 46, 22, 0.20)" },
    },
  },
  10: { // November - Harvest Wine & Walnut
    name: "November Harvest Wine & Walnut",
    denoms: {
      "1": { bg: "#fff7ed", border: "#451a03", circleBg: "#ffffff", text: "#431407", innerTint: "rgba(69, 26, 3, 0.18)" },
      "5": { bg: "#f43f5e", border: "#4c0519", circleBg: "#ffe4e6", text: "#4c0519", innerTint: "rgba(76, 5, 25, 0.20)" },
      "10": { bg: "#d97706", border: "#451a03", circleBg: "#fef3c7", text: "#451a03", innerTint: "rgba(69, 26, 3, 0.22)" },
      "20": { bg: "#16a34a", border: "#052e16", circleBg: "#dcfce7", text: "#022c22", innerTint: "rgba(5, 46, 22, 0.20)" },
    },
  },
  11: { // December - Holiday Holly & Evergreen
    name: "December Holiday Holly & Gold",
    denoms: {
      "1": { bg: "#ffffff", border: "#166534", circleBg: "#f0fdf4", text: "#052e16", innerTint: "rgba(22, 101, 52, 0.18)" },
      "5": { bg: "#f87171", border: "#7f1d1d", circleBg: "#fee2e2", text: "#450a0a", innerTint: "rgba(127, 29, 29, 0.20)" },
      "10": { bg: "#facc15", border: "#713f12", circleBg: "#fef08a", text: "#365314", innerTint: "rgba(113, 63, 18, 0.22)" },
      "20": { bg: "#22c55e", border: "#052e16", circleBg: "#bbf7d0", text: "#022c22", innerTint: "rgba(5, 46, 22, 0.20)" },
    },
  },
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
  const activePalette = MONTHLY_PALETTES[monthIdx] || MONTHLY_PALETTES[6];
  const photoColor = activePalette.denoms[denomValue] || activePalette.denoms["1"];

  const serialStr = getSerialString(config.stationPrefix, config.batchId, serialNum, config.digits, config.includeChecksum);
  const currentMonthYearStr = `${MONTH_NAMES_FULL[monthIdx].toUpperCase()} ${now.getFullYear()}`;

  const finePrintNotice = config.validityMode === "expires"
    ? `MUST BE DESTROYED BY DART SHRED DEPT ON: ${config.expirationDate || "END OF MONTH"} • BATCH: ${config.batchId}`
    : `VALID FOREVER ∞ • ISSUED: ${currentMonthYearStr} • BATCH: ${config.batchId}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}px" height="${height}px">
  <defs>
    <!-- Vector Drop Shadow Filter for 3D Text -->
    <filter id="text-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.38"/>
    </filter>

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

  <!-- Left Side Panel (DART Crest Box with Outer Box Border, Vector Text Stroke & Drop Shadow) -->
  <g transform="translate(90, ${height / 2 - 50})">
    <rect x="0" y="0" width="140" height="100" fill="${photoColor.circleBg}" fill-opacity="0.95" stroke="${photoColor.border}" stroke-width="4" rx="4"/>
    <text x="70" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="28" fill="${photoColor.text}" stroke="${photoColor.border}" stroke-width="1.5" stroke-linejoin="round" filter="url(#text-drop-shadow)" text-anchor="middle">DART</text>
    <line x1="20" y1="56" x2="120" y2="56" stroke="${photoColor.border}" stroke-width="2"/>
    <text x="70" y="74" font-family="sans-serif" font-weight="extrabold" font-size="11" fill="${photoColor.border}" stroke="${photoColor.border}" stroke-width="0.3" filter="url(#text-drop-shadow)" text-anchor="middle">EST. 1962</text>
  </g>

  <!-- Right Side Panel (DART House/Facility Icon Box with Outer Box Border) -->
  <g transform="translate(${width - 230}, ${height / 2 - 50})">
    <rect x="0" y="0" width="140" height="100" fill="${photoColor.circleBg}" fill-opacity="0.95" stroke="${photoColor.border}" stroke-width="4" rx="4"/>
    <!-- Monopoly House / Facility Roof Icon -->
    <path d="M 70 20 L 25 55 L 38 55 L 38 82 L 102 82 L 102 55 L 115 55 Z" fill="${photoColor.border}"/>
    <rect x="56" y="60" width="28" height="22" fill="${photoColor.circleBg}"/>
  </g>

  <!-- 4 Corner Rectangular Boxes (Featuring Outer Box Border, Vector Text Stroke & 3D Drop Shadow) -->
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

    <!-- Giant Center Denomination (Full Triad: Contrast Fill + Vector Text Stroke Border + 3D Drop Shadow) -->
    <text font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="170" fill="${photoColor.text}" stroke="${photoColor.border}" stroke-width="3.5" stroke-linejoin="round" filter="url(#text-drop-shadow)" text-anchor="middle" y="58">${denomValue}</text>

    <!-- Curved Text "DART BUCKS®" Along Bottom Inner Rim (Featuring Vector Stroke & Drop Shadow) -->
    <text font-family="sans-serif" font-weight="900" font-size="16" fill="${photoColor.border}" stroke="${photoColor.border}" stroke-width="0.5" filter="url(#text-drop-shadow)" letter-spacing="4" text-anchor="middle" y="145">• DART BUCKS ® •</text>
  </g>
  ` : ""}

  <!-- Transparent Serial Box Overlay with Box Border & Text Drop Shadow -->
  <g transform="translate(${width / 2 - 280}, ${height - 65})">
    <rect x="0" y="0" width="560" height="42" fill="#ffffff" fill-opacity="0.95" stroke="${photoColor.border}" stroke-width="2.5" rx="5"/>
    <text x="280" y="28" font-family="monospace" font-weight="bold" font-size="24" fill="#b91c1c" stroke="#991b1b" stroke-width="1.0" stroke-linejoin="round" filter="url(#text-drop-shadow)" text-anchor="middle">${serialStr}</text>
  </g>

  <!-- Hardcoded Fine Print Notice with High Contrast Fill, Vector Stroke & Drop Shadow -->
  <text x="45" y="${height - 24}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${photoColor.border}" stroke="${photoColor.border}" stroke-width="0.4" filter="url(#text-drop-shadow)" fill-opacity="0.95">${finePrintNotice}</text>
</svg>`;
};
