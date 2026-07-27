import { DartBuckConfig, DENOMINATIONS, DenomArtSlot } from "../types";
import { getSerialString, MONTH_NAMES_FULL } from "./security";

export interface MonthPalette {
  name: string;
  denoms: Record<string, { bg: string; border: string; circleBg: string; text: string; innerTint: string }>;
}

// 12-Month Matte Monopoly Color Palettes (Vibrant, Distinct Color Themes for White Matte Paper Stock)
export const MONTHLY_PALETTES: Record<number, MonthPalette> = {
  0: { // January - Matte Navy & Ice Blue
    name: "January Ice Navy",
    denoms: {
      "1": { bg: "#ffffff", border: "#1e293b", circleBg: "#f1f5f9", text: "#0f172a", innerTint: "rgba(30, 41, 59, 0.12)" },
      "5": { bg: "#ffffff", border: "#0284c7", circleBg: "#e0f2fe", text: "#0369a1", innerTint: "rgba(2, 132, 199, 0.14)" },
      "10": { bg: "#ffffff", border: "#2563eb", circleBg: "#dbeafe", text: "#1d4ed8", innerTint: "rgba(37, 99, 235, 0.14)" },
      "20": { bg: "#ffffff", border: "#0d9488", circleBg: "#ccfbf1", text: "#0f766e", innerTint: "rgba(13, 148, 136, 0.14)" },
    },
  },
  1: { // February - Matte Rose & Magenta
    name: "February Rose Magenta",
    denoms: {
      "1": { bg: "#ffffff", border: "#4c0519", circleBg: "#ffe4e6", text: "#881337", innerTint: "rgba(76, 5, 25, 0.12)" },
      "5": { bg: "#ffffff", border: "#be185d", circleBg: "#fce7f3", text: "#9d174d", innerTint: "rgba(190, 24, 93, 0.14)" },
      "10": { bg: "#ffffff", border: "#e11d48", circleBg: "#ffe4e6", text: "#be123c", innerTint: "rgba(225, 29, 72, 0.14)" },
      "20": { bg: "#ffffff", border: "#7e22ce", circleBg: "#f3e8ff", text: "#6b21a8", innerTint: "rgba(126, 34, 206, 0.14)" },
    },
  },
  2: { // March - Matte Shamrock & Mint Green
    name: "March Shamrock Mint",
    denoms: {
      "1": { bg: "#ffffff", border: "#14532d", circleBg: "#dcfce7", text: "#15803d", innerTint: "rgba(20, 83, 45, 0.12)" },
      "5": { bg: "#ffffff", border: "#4d7c0f", circleBg: "#ecfccb", text: "#3f6212", innerTint: "rgba(77, 124, 15, 0.14)" },
      "10": { bg: "#ffffff", border: "#b45309", circleBg: "#fef3c7", text: "#78350f", innerTint: "rgba(180, 83, 9, 0.14)" },
      "20": { bg: "#ffffff", border: "#047857", circleBg: "#d1fae5", text: "#065f46", innerTint: "rgba(4, 120, 87, 0.14)" },
    },
  },
  3: { // April - Matte Lavender & Pastel Spring
    name: "April Pastel Spring",
    denoms: {
      "1": { bg: "#ffffff", border: "#475569", circleBg: "#f1f5f9", text: "#334155", innerTint: "rgba(71, 85, 105, 0.12)" },
      "5": { bg: "#ffffff", border: "#a21caf", circleBg: "#fae8ff", text: "#86198f", innerTint: "rgba(162, 28, 175, 0.14)" },
      "10": { bg: "#ffffff", border: "#c2410c", circleBg: "#ffedd5", text: "#9a3412", innerTint: "rgba(194, 65, 12, 0.14)" },
      "20": { bg: "#ffffff", border: "#15803d", circleBg: "#dcfce7", text: "#166534", innerTint: "rgba(21, 128, 61, 0.14)" },
    },
  },
  4: { // May - Matte Solar Gold & Amber
    name: "May Solar Gold",
    denoms: {
      "1": { bg: "#ffffff", border: "#78350f", circleBg: "#fef3c7", text: "#451a03", innerTint: "rgba(120, 53, 15, 0.12)" },
      "5": { bg: "#ffffff", border: "#c2410c", circleBg: "#ffedd5", text: "#9a3412", innerTint: "rgba(194, 65, 12, 0.14)" },
      "10": { bg: "#ffffff", border: "#d97706", circleBg: "#fef3c7", text: "#b45309", innerTint: "rgba(217, 119, 6, 0.14)" },
      "20": { bg: "#ffffff", border: "#047857", circleBg: "#d1fae5", text: "#065f46", innerTint: "rgba(4, 120, 87, 0.14)" },
    },
  },
  5: { // June - Matte Cyan & Marine Teal
    name: "June Marine Cyan",
    denoms: {
      "1": { bg: "#ffffff", border: "#0f172a", circleBg: "#f1f5f9", text: "#0f172a", innerTint: "rgba(15, 23, 42, 0.12)" },
      "5": { bg: "#ffffff", border: "#be185d", circleBg: "#fce7f3", text: "#831843", innerTint: "rgba(190, 24, 93, 0.14)" },
      "10": { bg: "#ffffff", border: "#0891b2", circleBg: "#cffafe", text: "#0e7490", innerTint: "rgba(8, 145, 178, 0.14)" },
      "20": { bg: "#ffffff", border: "#0f766e", circleBg: "#ccfbf1", text: "#115e59", innerTint: "rgba(15, 118, 110, 0.14)" },
    },
  },
  6: { // July - Classic Matte Monopoly Ink (Default)
    name: "July Classic Monopoly",
    denoms: {
      "1": { bg: "#ffffff", border: "#18181b", circleBg: "#f4f4f5", text: "#09090b", innerTint: "rgba(24, 24, 27, 0.12)" },
      "5": { bg: "#ffffff", border: "#be185d", circleBg: "#fce7f3", text: "#831843", innerTint: "rgba(190, 24, 93, 0.14)" },
      "10": { bg: "#ffffff", border: "#b45309", circleBg: "#fef3c7", text: "#78350f", innerTint: "rgba(180, 83, 9, 0.14)" },
      "20": { bg: "#ffffff", border: "#047857", circleBg: "#d1fae5", text: "#064e3b", innerTint: "rgba(4, 120, 87, 0.14)" },
    },
  },
  7: { // August - Matte Solar Blaze & Coral
    name: "August Solar Blaze",
    denoms: {
      "1": { bg: "#ffffff", border: "#78350f", circleBg: "#fef3c7", text: "#451a03", innerTint: "rgba(120, 53, 15, 0.12)" },
      "5": { bg: "#ffffff", border: "#ea580c", circleBg: "#ffedd5", text: "#c2410c", innerTint: "rgba(234, 88, 12, 0.14)" },
      "10": { bg: "#ffffff", border: "#d97706", circleBg: "#fef3c7", text: "#b45309", innerTint: "rgba(217, 119, 6, 0.14)" },
      "20": { bg: "#ffffff", border: "#15803d", circleBg: "#dcfce7", text: "#166534", innerTint: "rgba(21, 128, 61, 0.14)" },
    },
  },
  8: { // September - Matte Autumn Copper & Amber
    name: "September Autumn Copper",
    denoms: {
      "1": { bg: "#ffffff", border: "#9a3412", circleBg: "#ffedd5", text: "#7c2d12", innerTint: "rgba(154, 52, 18, 0.12)" },
      "5": { bg: "#ffffff", border: "#9f1239", circleBg: "#ffe4e6", text: "#881337", innerTint: "rgba(159, 18, 57, 0.14)" },
      "10": { bg: "#ffffff", border: "#c2410c", circleBg: "#ffedd5", text: "#9a3412", innerTint: "rgba(194, 65, 12, 0.14)" },
      "20": { bg: "#ffffff", border: "#4d7c0f", circleBg: "#ecfccb", text: "#3f6212", innerTint: "rgba(77, 124, 15, 0.14)" },
    },
  },
  9: { // October - Matte Pumpkin & Plum
    name: "October Pumpkin Plum",
    denoms: {
      "1": { bg: "#ffffff", border: "#18181b", circleBg: "#f4f4f5", text: "#09090b", innerTint: "rgba(24, 24, 27, 0.12)" },
      "5": { bg: "#ffffff", border: "#6b21a8", circleBg: "#f3e8ff", text: "#581c87", innerTint: "rgba(107, 33, 168, 0.14)" },
      "10": { bg: "#ffffff", border: "#ea580c", circleBg: "#ffedd5", text: "#c2410c", innerTint: "rgba(234, 88, 12, 0.14)" },
      "20": { bg: "#ffffff", border: "#14532d", circleBg: "#dcfce7", text: "#052e16", innerTint: "rgba(20, 83, 45, 0.14)" },
    },
  },
  10: { // November - Matte Wine & Walnut
    name: "November Wine Walnut",
    denoms: {
      "1": { bg: "#ffffff", border: "#78350f", circleBg: "#fef3c7", text: "#451a03", innerTint: "rgba(120, 53, 15, 0.12)" },
      "5": { bg: "#ffffff", border: "#881337", circleBg: "#ffe4e6", text: "#4c0519", innerTint: "rgba(136, 19, 55, 0.14)" },
      "10": { bg: "#ffffff", border: "#92400e", circleBg: "#fef3c7", text: "#78350f", innerTint: "rgba(146, 64, 14, 0.14)" },
      "20": { bg: "#ffffff", border: "#14532d", circleBg: "#dcfce7", text: "#052e16", innerTint: "rgba(20, 83, 45, 0.14)" },
    },
  },
  11: { // December - Matte Holly & Evergreen
    name: "December Holly Evergreen",
    denoms: {
      "1": { bg: "#ffffff", border: "#166534", circleBg: "#dcfce7", text: "#14532d", innerTint: "rgba(22, 101, 52, 0.12)" },
      "5": { bg: "#ffffff", border: "#991b1b", circleBg: "#fee2e2", text: "#7f1d1d", innerTint: "rgba(153, 27, 27, 0.14)" },
      "10": { bg: "#ffffff", border: "#b45309", circleBg: "#fef3c7", text: "#78350f", innerTint: "rgba(180, 83, 9, 0.14)" },
      "20": { bg: "#ffffff", border: "#14532d", circleBg: "#dcfce7", text: "#052e16", innerTint: "rgba(20, 83, 45, 0.14)" },
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
    <!-- Matte Print Solid Text Shadow -->
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
