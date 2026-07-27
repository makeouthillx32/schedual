import { DartBuckConfig, DENOMINATIONS, DenomArtSlot } from "../types";
import { getSerialString, MONTH_NAMES_FULL } from "./security";

export interface MonthPalette {
  name: string;
  denoms: Record<string, { bg: string; border: string; circleBg: string; text: string; innerTint: string }>;
}

// Matte Intaglio Print Color Palettes (Flat Matte Inks for White Paper Stock)
export const MONTHLY_PALETTES: Record<number, MonthPalette> = {
  0: { // January - Matte Navy & Ice
    name: "January Matte Navy",
    denoms: {
      "1": { bg: "#ffffff", border: "#1e293b", circleBg: "#ffffff", text: "#0f172a", innerTint: "rgba(30, 41, 59, 0.08)" },
      "5": { bg: "#ffffff", border: "#0369a1", circleBg: "#f0f9ff", text: "#0c4a6e", innerTint: "rgba(3, 105, 161, 0.10)" },
      "10": { bg: "#ffffff", border: "#0f172a", circleBg: "#e0f2fe", text: "#0369a1", innerTint: "rgba(15, 23, 42, 0.12)" },
      "20": { bg: "#ffffff", border: "#064e3b", circleBg: "#ecfdf5", text: "#022c22", innerTint: "rgba(6, 78, 59, 0.10)" },
    },
  },
  1: { // February - Matte Rose
    name: "February Matte Rose",
    denoms: {
      "1": { bg: "#ffffff", border: "#4c0519", circleBg: "#ffffff", text: "#4c0519", innerTint: "rgba(76, 5, 25, 0.08)" },
      "5": { bg: "#ffffff", border: "#831843", circleBg: "#fdf2f8", text: "#500724", innerTint: "rgba(131, 24, 67, 0.10)" },
      "10": { bg: "#ffffff", border: "#881337", circleBg: "#fff1f2", text: "#4c0519", innerTint: "rgba(136, 19, 55, 0.12)" },
      "20": { bg: "#ffffff", border: "#581c87", circleBg: "#faf5ff", text: "#3b0764", innerTint: "rgba(88, 28, 135, 0.10)" },
    },
  },
  2: { // March - Matte Shamrock
    name: "March Matte Shamrock",
    denoms: {
      "1": { bg: "#ffffff", border: "#14532d", circleBg: "#ffffff", text: "#052e16", innerTint: "rgba(20, 83, 45, 0.08)" },
      "5": { bg: "#ffffff", border: "#3f6212", circleBg: "#f7fee7", text: "#1a2e05", innerTint: "rgba(63, 98, 18, 0.10)" },
      "10": { bg: "#ffffff", border: "#78350f", circleBg: "#fffbeb", text: "#451a03", innerTint: "rgba(120, 53, 15, 0.12)" },
      "20": { bg: "#ffffff", border: "#064e3b", circleBg: "#ecfdf5", text: "#022c22", innerTint: "rgba(6, 78, 59, 0.10)" },
    },
  },
  3: { // April - Matte Pastel
    name: "April Matte Pastel",
    denoms: {
      "1": { bg: "#ffffff", border: "#334155", circleBg: "#ffffff", text: "#0f172a", innerTint: "rgba(51, 65, 85, 0.08)" },
      "5": { bg: "#ffffff", border: "#701a75", circleBg: "#fdf2f8", text: "#4a044e", innerTint: "rgba(112, 26, 117, 0.10)" },
      "10": { bg: "#ffffff", border: "#713f12", circleBg: "#fefce8", text: "#365314", innerTint: "rgba(113, 63, 18, 0.12)" },
      "20": { bg: "#ffffff", border: "#14532d", circleBg: "#f0fdf4", text: "#052e16", innerTint: "rgba(20, 83, 45, 0.10)" },
    },
  },
  4: { // May - Matte Solar Gold
    name: "May Matte Solar Gold",
    denoms: {
      "1": { bg: "#ffffff", border: "#78350f", circleBg: "#ffffff", text: "#451a03", innerTint: "rgba(120, 53, 15, 0.08)" },
      "5": { bg: "#ffffff", border: "#7c2d12", circleBg: "#fff7ed", text: "#431407", innerTint: "rgba(124, 45, 18, 0.10)" },
      "10": { bg: "#ffffff", border: "#451a03", circleBg: "#fefce8", text: "#3b1e06", innerTint: "rgba(69, 26, 3, 0.12)" },
      "20": { bg: "#ffffff", border: "#064e3b", circleBg: "#f0fdf4", text: "#022c22", innerTint: "rgba(6, 78, 59, 0.10)" },
    },
  },
  5: { // June - Matte Cyan Breeze
    name: "June Matte Cyan Breeze",
    denoms: {
      "1": { bg: "#ffffff", border: "#0f172a", circleBg: "#ffffff", text: "#0c4a6e", innerTint: "rgba(15, 23, 42, 0.08)" },
      "5": { bg: "#ffffff", border: "#881337", circleBg: "#fff1f2", text: "#4c0519", innerTint: "rgba(136, 19, 55, 0.10)" },
      "10": { bg: "#ffffff", border: "#164e63", circleBg: "#ecfeff", text: "#083344", innerTint: "rgba(22, 78, 99, 0.12)" },
      "20": { bg: "#ffffff", border: "#115e59", circleBg: "#f0fdf4", text: "#042f2e", innerTint: "rgba(17, 94, 89, 0.10)" },
    },
  },
  6: { // July - Classic Matte Monopoly Ink (Default)
    name: "July Classic Matte Monopoly",
    denoms: {
      "1": { bg: "#ffffff", border: "#27272a", circleBg: "#ffffff", text: "#09090b", innerTint: "rgba(39, 39, 42, 0.08)" },
      "5": { bg: "#ffffff", border: "#831843", circleBg: "#fdf2f8", text: "#500724", innerTint: "rgba(131, 24, 67, 0.10)" },
      "10": { bg: "#ffffff", border: "#713f12", circleBg: "#fefce8", text: "#365314", innerTint: "rgba(113, 63, 18, 0.12)" },
      "20": { bg: "#ffffff", border: "#064e3b", circleBg: "#f0fdf4", text: "#022c22", innerTint: "rgba(6, 78, 59, 0.10)" },
    },
  },
  7: { // August - Matte Solar Blaze
    name: "August Matte Solar Blaze",
    denoms: {
      "1": { bg: "#ffffff", border: "#713f12", circleBg: "#ffffff", text: "#451a03", innerTint: "rgba(113, 63, 18, 0.08)" },
      "5": { bg: "#ffffff", border: "#7c2d12", circleBg: "#fff7ed", text: "#431407", innerTint: "rgba(124, 45, 18, 0.10)" },
      "10": { bg: "#ffffff", border: "#713f12", circleBg: "#fefce8", text: "#3b1e06", innerTint: "rgba(113, 63, 18, 0.12)" },
      "20": { bg: "#ffffff", border: "#14532d", circleBg: "#f0fdf4", text: "#052e16", innerTint: "rgba(20, 83, 45, 0.10)" },
    },
  },
  8: { // September - Matte Autumn Copper
    name: "September Matte Autumn Copper",
    denoms: {
      "1": { bg: "#ffffff", border: "#7c2d12", circleBg: "#ffffff", text: "#431407", innerTint: "rgba(124, 45, 18, 0.08)" },
      "5": { bg: "#ffffff", border: "#881337", circleBg: "#fff1f2", text: "#4c0519", innerTint: "rgba(136, 19, 55, 0.10)" },
      "10": { bg: "#ffffff", border: "#7c2d12", circleBg: "#fff7ed", text: "#431407", innerTint: "rgba(124, 45, 18, 0.12)" },
      "20": { bg: "#ffffff", border: "#365314", circleBg: "#f7fee7", text: "#1a2e05", innerTint: "rgba(54, 83, 20, 0.10)" },
    },
  },
  9: { // October - Matte Pumpkin & Plum
    name: "October Matte Pumpkin & Plum",
    denoms: {
      "1": { bg: "#ffffff", border: "#18181b", circleBg: "#ffffff", text: "#09090b", innerTint: "rgba(24, 24, 27, 0.08)" },
      "5": { bg: "#ffffff", border: "#581c87", circleBg: "#faf5ff", text: "#3b0764", innerTint: "rgba(88, 28, 135, 0.10)" },
      "10": { bg: "#ffffff", border: "#1c1917", circleBg: "#fff7ed", text: "#431407", innerTint: "rgba(28, 25, 23, 0.12)" },
      "20": { bg: "#ffffff", border: "#052e16", circleBg: "#f0fdf4", text: "#022c22", innerTint: "rgba(5, 46, 22, 0.10)" },
    },
  },
  10: { // November - Matte Wine & Walnut
    name: "November Matte Wine & Walnut",
    denoms: {
      "1": { bg: "#ffffff", border: "#451a03", circleBg: "#ffffff", text: "#431407", innerTint: "rgba(69, 26, 3, 0.08)" },
      "5": { bg: "#ffffff", border: "#4c0519", circleBg: "#fff1f2", text: "#4c0519", innerTint: "rgba(76, 5, 25, 0.10)" },
      "10": { bg: "#ffffff", border: "#451a03", circleBg: "#fffbeb", text: "#451a03", innerTint: "rgba(69, 26, 3, 0.12)" },
      "20": { bg: "#ffffff", border: "#052e16", circleBg: "#f0fdf4", text: "#022c22", innerTint: "rgba(5, 46, 22, 0.10)" },
    },
  },
  11: { // December - Matte Holly & Evergreen
    name: "December Matte Holly & Evergreen",
    denoms: {
      "1": { bg: "#ffffff", border: "#166534", circleBg: "#ffffff", text: "#052e16", innerTint: "rgba(22, 101, 52, 0.08)" },
      "5": { bg: "#ffffff", border: "#7f1d1d", circleBg: "#fff1f2", text: "#450a0a", innerTint: "rgba(127, 29, 29, 0.10)" },
      "10": { bg: "#ffffff", border: "#713f12", circleBg: "#fefce8", text: "#365314", innerTint: "rgba(113, 63, 18, 0.12)" },
      "20": { bg: "#ffffff", border: "#052e16", circleBg: "#f0fdf4", text: "#022c22", innerTint: "rgba(5, 46, 22, 0.10)" },
    },
  },
};

// DESTRUCTIVE SHRED DEPARTMENT MATTE COLOR VARIANT
export const DESTRUCTIVE_SHRED_COLORS: Record<string, { bg: string; border: string; circleBg: string; text: string; innerTint: string }> = {
  "1": { bg: "#ffffff", border: "#991b1b", circleBg: "#fef2f2", text: "#7f1d1d", innerTint: "rgba(153, 27, 27, 0.15)" },
  "5": { bg: "#ffffff", border: "#991b1b", circleBg: "#fff1f2", text: "#881337", innerTint: "rgba(153, 27, 27, 0.15)" },
  "10": { bg: "#ffffff", border: "#78350f", circleBg: "#fffbeb", text: "#713f12", innerTint: "rgba(120, 53, 15, 0.15)" },
  "20": { bg: "#ffffff", border: "#991b1b", circleBg: "#fef2f2", text: "#7f1d1d", innerTint: "rgba(153, 27, 27, 0.15)" },
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
    <!-- Matte Print Solid Text Shadow (No Reflective Computer Glows) -->
    <filter id="matte-text-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="2" stdDeviation="0.5" flood-color="#000000" flood-opacity="0.35"/>
    </filter>

    <!-- Flat Matte Intaglio Micro-Line Texture -->
    <pattern id="matte-intaglio-mesh" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M 0 8 L 8 0 M -2 2 L 2 -2 M 6 10 L 10 6" stroke="${photoColor.border}" stroke-width="0.8" stroke-opacity="0.25"/>
    </pattern>

    <!-- Corner Filigree Scroll Group -->
    <g id="fancy-scroll">
      <path d="M 0 0 C 20 -15, 40 -8, 45 12 C 50 32, 25 45, 12 32 C 0 20, 25 8, 32 16" fill="none" stroke="${photoColor.border}" stroke-width="2.5"/>
      <circle cx="32" cy="16" r="3" fill="${photoColor.border}"/>
    </g>
  </defs>

  <!-- White Matte Paper Stock Base -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>

  ${config.showPresetBorders ? `
  <!-- Flat Matte Intaglio Monopoly Borders -->
  <!-- 1. Outer Solid Thick Border Line -->
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="${photoColor.border}" stroke-width="10"/>

  <!-- 2. Middle Hatched Border Frame -->
  <rect x="36" y="36" width="${width - 72}" height="${height - 72}" fill="url(#matte-intaglio-mesh)" stroke="${photoColor.border}" stroke-width="2"/>

  <!-- 3. Inner Decorative Dashed Border Line -->
  <rect x="52" y="52" width="${width - 104}" height="${height - 104}" fill="${photoColor.innerTint}" stroke="${photoColor.border}" stroke-width="2.5" stroke-dasharray="10,5"/>

  <!-- Ornate Corner Filigree Scrolls -->
  <use href="#fancy-scroll" x="65" y="65"/>
  <use href="#fancy-scroll" x="${width - 65}" y="65" transform="scale(-1, 1) translate(${-width + 130}, 0)"/>
  <use href="#fancy-scroll" x="65" y="${height - 65}" transform="scale(1, -1) translate(0, ${-height + 130})"/>
  <use href="#fancy-scroll" x="${width - 65}" y="${height - 65}" transform="scale(-1, -1) translate(${-width + 130}, ${-height + 130})"/>

  <!-- Left Side Panel (DART Crest Box) -->
  <g transform="translate(90, ${height / 2 - 50})">
    <rect x="0" y="0" width="140" height="100" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="4"/>
    <text x="70" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="28" fill="${photoColor.text}" stroke="${photoColor.border}" stroke-width="1.2" stroke-linejoin="round" filter="url(#matte-text-shadow)" text-anchor="middle">DART</text>
    <line x1="20" y1="56" x2="120" y2="56" stroke="${photoColor.border}" stroke-width="2"/>
    <text x="70" y="74" font-family="sans-serif" font-weight="extrabold" font-size="11" fill="${photoColor.border}" text-anchor="middle">EST. 1962</text>
  </g>

  <!-- Right Side Panel (DART House/Facility Icon Box) -->
  <g transform="translate(${width - 230}, ${height / 2 - 50})">
    <rect x="0" y="0" width="140" height="100" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="4"/>
    <path d="M 70 20 L 25 55 L 38 55 L 38 82 L 102 82 L 102 55 L 115 55 Z" fill="${photoColor.border}"/>
    <rect x="56" y="60" width="28" height="22" fill="${photoColor.circleBg}"/>
  </g>

  <!-- 4 Corner Rectangular Boxes -->
  <!-- Top-Left Box -->
  <g transform="translate(80, 70)">
    <rect x="0" y="0" width="110" height="60" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="3"/>
    <text x="55" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="42" fill="${photoColor.text}" stroke="${photoColor.border}" stroke-width="1.8" stroke-linejoin="round" filter="url(#matte-text-shadow)" text-anchor="middle">${denomValue}</text>
  </g>

  <!-- Top-Right Box -->
  <g transform="translate(${width - 190}, 70)">
    <rect x="0" y="0" width="110" height="60" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="3"/>
    <text x="55" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="42" fill="${photoColor.text}" stroke="${photoColor.border}" stroke-width="1.8" stroke-linejoin="round" filter="url(#matte-text-shadow)" text-anchor="middle">${denomValue}</text>
  </g>

  <!-- Bottom-Left Box -->
  <g transform="translate(80, ${height - 130})">
    <rect x="0" y="0" width="110" height="60" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="3"/>
    <text x="55" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="42" fill="${photoColor.text}" stroke="${photoColor.border}" stroke-width="1.8" stroke-linejoin="round" filter="url(#matte-text-shadow)" text-anchor="middle">${denomValue}</text>
  </g>

  <!-- Bottom-Right Box -->
  <g transform="translate(${width - 190}, ${height - 130})">
    <rect x="0" y="0" width="110" height="60" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="4" rx="3"/>
    <text x="55" y="44" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="42" fill="${photoColor.text}" stroke="${photoColor.border}" stroke-width="1.8" stroke-linejoin="round" filter="url(#matte-text-shadow)" text-anchor="middle">${denomValue}</text>
  </g>
  ` : ""}

  ${config.showPresetText ? `
  <!-- Classic Monopoly Center Circle -->
  <g transform="translate(${width / 2}, ${height / 2})">
    <circle cx="0" cy="0" r="180" fill="${photoColor.circleBg}" stroke="${photoColor.border}" stroke-width="8"/>
    <circle cx="0" cy="0" r="168" fill="none" stroke="${photoColor.border}" stroke-width="2" stroke-dasharray="8,4"/>

    <!-- Giant Center Denomination (Solid Matte Fill, Intaglio Line Stroke, Solid Matte Shadow) -->
    <text font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="170" fill="${photoColor.text}" stroke="${photoColor.border}" stroke-width="3.2" stroke-linejoin="round" filter="url(#matte-text-shadow)" text-anchor="middle" y="58">${denomValue}</text>

    <!-- Curved Text "DART BUCKS®" Along Bottom Inner Rim -->
    <text font-family="sans-serif" font-weight="900" font-size="16" fill="${photoColor.border}" letter-spacing="4" text-anchor="middle" y="145">• DART BUCKS ® •</text>
  </g>
  ` : ""}

  <!-- Serial Box Overlay with Solid Matte Border -->
  <g transform="translate(${width / 2 - 280}, ${height - 65})">
    <rect x="0" y="0" width="560" height="42" fill="#ffffff" fill-opacity="0.98" stroke="${photoColor.border}" stroke-width="2.5" rx="5"/>
    <text x="280" y="28" font-family="monospace" font-weight="bold" font-size="24" fill="${isDestructive ? '#dc2626' : '#b91c1c'}" stroke="${isDestructive ? '#991b1b' : '#991b1b'}" stroke-width="0.8" text-anchor="middle">${serialStr}</text>
  </g>

  <!-- Hardcoded Fine Print Notice (Razor-Sharp Fine Lines for Crisp Matte Paper Printing) -->
  <text x="45" y="${height - 24}" font-family="sans-serif" font-size="10" font-weight="bold" fill="${photoColor.border}" stroke="${photoColor.border}" stroke-width="0.2" fill-opacity="0.95">${finePrintNotice}</text>
</svg>`;
};
