import { DartBuckConfig, DENOMINATIONS, DenomArtSlot } from "../types";
import { getSerialString, isLightBg, MONTH_NAMES_FULL } from "./security";

export const getBatchAccentColor = (batchId: string, defaultColor: string): string => {
  if (!batchId) return defaultColor;
  let hash = 0;
  for (let i = 0; i < batchId.length; i++) {
    hash = batchId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 45%)`;
};

export const generateDartBuckSVG = (
  serialNum: number,
  config: DartBuckConfig,
  denomSlots: Record<string, DenomArtSlot>,
  denomValue = config.denomination,
  width = 1200,
  height = 469
): string => {
  const style = DENOMINATIONS[denomValue] || DENOMINATIONS["1"];
  const batchColor = getBatchAccentColor(config.batchId, style.border);
  const serialStr = getSerialString(config.stationPrefix, config.batchId, serialNum, config.digits, config.includeChecksum);
  const slot = denomSlots[denomValue];

  const now = new Date();
  const currentMonthYearStr = `${MONTH_NAMES_FULL[now.getMonth()].toUpperCase()} ${now.getFullYear()}`;

  const customImgSvg = slot && slot.image_url
    ? `<image href="${slot.image_url}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none"/>`
    : "";

  // Fine Print Validity / Expiration Notice
  const finePrintNotice = config.validityMode === "expires"
    ? `MUST BE DESTROYED BY DART SHRED DEPT ON: ${config.expirationDate || "END OF MONTH"} • BATCH: ${config.batchId}`
    : `VALID FOREVER ∞ • ISSUED: ${currentMonthYearStr} • BATCH: ${config.batchId}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}px" height="${height}px">
  <defs>
    <!-- Paper Grain Noise Filter -->
    <filter id="monopoly-grain" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.07 0" in="noise" result="coloredNoise"/>
      <feComposite operator="in" in="coloredNoise" in2="SourceGraphic"/>
    </filter>

    <!-- Small White Stipple Texture Pattern (Transparent Overlay) -->
    <pattern id="white-texture-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.8" fill="#ffffff" fill-opacity="0.35"/>
      <circle cx="12" cy="8" r="0.6" fill="#ffffff" fill-opacity="0.25"/>
      <circle cx="6" cy="16" r="0.9" fill="#ffffff" fill-opacity="0.3"/>
      <circle cx="17" cy="14" r="0.7" fill="#ffffff" fill-opacity="0.2"/>
      <line x1="0" y1="10" x2="20" y2="10" stroke="#ffffff" stroke-opacity="0.08" stroke-width="0.5"/>
    </pattern>

    <!-- Intaglio Cross-Hatch Shading Pattern -->
    <pattern id="intaglio-hatch" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M 0 8 L 8 0 M -2 2 L 2 -2 M 6 10 L 10 6" stroke="${batchColor}" stroke-width="0.8" stroke-opacity="0.3"/>
    </pattern>

    <!-- Guilloche Hatch Mesh Pattern -->
    <pattern id="guilloche-mesh" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 0 20 Q 10 0, 20 20 T 40 20" fill="none" stroke="${batchColor}" stroke-opacity="0.12" stroke-width="1"/>
      <path d="M 0 20 Q 10 40, 20 20 T 40 20" fill="none" stroke="${batchColor}" stroke-opacity="0.12" stroke-width="1"/>
    </pattern>

    <!-- Victorian Filigree Scroll Vignette Group -->
    <g id="scroll-flourish">
      <path d="M 0 0 C 15 -10, 30 -5, 35 10 C 40 25, 20 35, 10 25 C 0 15, 20 5, 25 12" fill="none" stroke="${batchColor}" stroke-width="1.8" stroke-opacity="0.7"/>
      <circle cx="25" cy="12" r="2" fill="${batchColor}" fill-opacity="0.8"/>
    </g>

    <!-- Text Path Curve -->
    <path id="arch-curve" d="M 370 200 A 230 150 0 0 1 830 200"/>
  </defs>

  <!-- Background Base -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="${style.bg}"/>

  ${customImgSvg}

  <!-- Texture Overlays (Transparent White Texture & Intaglio Mesh) -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#white-texture-dots)"/>
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#guilloche-mesh)"/>

  ${config.showPresetBorders ? `
  <!-- Outer Guilloche Double Border with Corner Filigree Scrolls -->
  <rect x="16" y="16" width="${width - 32}" height="${height - 32}" fill="none" stroke="${batchColor}" stroke-width="4"/>
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="none" stroke="${style.border}" stroke-width="1.5" stroke-dasharray="8,4"/>

  <!-- Ornate Corner Filigree Flourishes -->
  <use href="#scroll-flourish" x="35" y="35"/>
  <use href="#scroll-flourish" x="${width - 35}" y="35" transform="scale(-1, 1) translate(${-width + 70}, 0)"/>
  <use href="#scroll-flourish" x="35" y="${height - 35}" transform="scale(1, -1) translate(0, ${-height + 70})"/>
  <use href="#scroll-flourish" x="${width - 35}" y="${height - 35}" transform="scale(-1, -1) translate(${-width + 70}, ${-height + 70})"/>

  <!-- Four Corner Monopoly Circles (Transparent Backed) -->
  <g transform="translate(78, 78)">
    <circle cx="0" cy="0" r="54" fill="${style.circleBg}" fill-opacity="0.95" stroke="${batchColor}" stroke-width="3"/>
    <text x="0" y="-12" font-family="sans-serif" font-weight="bold" font-size="16" fill="#000000" text-anchor="middle">DART</text>
    <text x="0" y="-2" font-family="sans-serif" font-size="4" fill="#000000" text-anchor="middle">DESERT AREA RESOURCES</text>
    <line x1="-25" y1="6" x2="25" y2="6" stroke="#000000" stroke-width="1"/>
    <text x="20" y="18" font-family="cursive, sans-serif" font-size="6" italic="true" fill="#000000" text-anchor="end">Est. 1962</text>
  </g>

  <g transform="translate(${width - 78}, 78)">
    <circle cx="0" cy="0" r="54" fill="${style.circleBg}" fill-opacity="0.95" stroke="${batchColor}" stroke-width="3"/>
    <text x="0" y="18" font-family="serif" font-weight="bold" font-size="52" fill="#000000" text-anchor="middle">${denomValue}</text>
  </g>

  <g transform="translate(78, ${height - 78})">
    <circle cx="0" cy="0" r="54" fill="${style.circleBg}" fill-opacity="0.95" stroke="${batchColor}" stroke-width="3"/>
    <text x="0" y="18" font-family="serif" font-weight="bold" font-size="52" fill="#000000" text-anchor="middle">${denomValue}</text>
  </g>

  <g transform="translate(${width - 78}, ${height - 78})">
    <circle cx="0" cy="0" r="54" fill="${style.circleBg}" fill-opacity="0.95" stroke="${batchColor}" stroke-width="3"/>
    <text x="0" y="-12" font-family="sans-serif" font-weight="bold" font-size="16" fill="#000000" text-anchor="middle">DART</text>
    <text x="0" y="-2" font-family="sans-serif" font-size="4" fill="#000000" text-anchor="middle">DESERT AREA RESOURCES</text>
    <line x1="-25" y1="6" x2="25" y2="6" stroke="#000000" stroke-width="1"/>
    <text x="20" y="18" font-family="cursive, sans-serif" font-size="6" italic="true" fill="#000000" text-anchor="end">Est. 1962</text>
  </g>

  <!-- Side $ Symbols -->
  <text x="220" y="${height / 2 + 25}" font-family="sans-serif" font-weight="bold" font-size="84" fill="${batchColor}" text-anchor="middle" fill-opacity="0.9">$</text>
  <text x="${width - 220}" y="${height / 2 + 25}" font-family="sans-serif" font-weight="bold" font-size="84" fill="${batchColor}" text-anchor="middle" fill-opacity="0.9">$</text>
  ` : ""}

  ${config.showPresetText ? `
  <!-- Center Monopoly Oval -->
  <g transform="translate(${width / 2}, ${height / 2 - 10})">
    <ellipse cx="0" cy="0" rx="200" ry="140" fill="${style.circleBg}" fill-opacity="0.94" stroke="${batchColor}" stroke-width="4"/>
    <ellipse cx="0" cy="0" rx="190" ry="130" fill="none" stroke="${style.border}" stroke-width="1.5" stroke-dasharray="6,3"/>

    <!-- Curved Text "DART BUCKS" -->
    <text font-family="serif" font-weight="bold" font-size="38" fill="#000000" text-anchor="middle" y="-50">DART BUCKS</text>

    <!-- Giant Center Denomination with Intaglio Cross-Hatch Fill -->
    <text font-family="serif" font-weight="bold" font-size="110" fill="url(#intaglio-hatch)" stroke="#000000" stroke-width="4" text-anchor="middle" y="35">${denomValue}</text>

    <!-- Subtitle Denomination & Current Month/Year Treasury Seal -->
    <text font-family="sans-serif" font-weight="bold" font-size="12" fill="${batchColor}" text-anchor="middle" y="98">$${denomValue} DENOMINATION</text>
    <text font-family="monospace" font-weight="bold" font-size="9" fill="#475569" text-anchor="middle" y="114">• ${currentMonthYearStr} ISSUE •</text>
  </g>
  ` : ""}

  <!-- Dual Treasury Signature Lines -->
  <g transform="translate(180, ${height - 110})">
    <line x1="0" y1="0" x2="160" y2="0" stroke="#334155" stroke-width="1.5"/>
    <text x="80" y="16" font-family="sans-serif" font-weight="bold" font-size="9" fill="#475569" text-anchor="middle">Treasurer / Manager Darlene</text>
  </g>

  <g transform="translate(${width - 340}, ${height - 110})">
    <line x1="0" y1="0" x2="160" y2="0" stroke="#334155" stroke-width="1.5"/>
    <text x="80" y="16" font-family="sans-serif" font-weight="bold" font-size="9" fill="#475569" text-anchor="middle">Secretary / Job Coach</text>
  </g>

  <!-- Transparent Serial Box Overlay -->
  <g transform="translate(${width / 2 - 280}, ${height - 60})">
    <rect x="0" y="0" width="560" height="45" fill="#ffffff" fill-opacity="0.92" stroke="#cbd5e1" stroke-width="2" rx="4"/>
    <text x="280" y="30" font-family="monospace" font-weight="bold" font-size="26" fill="#b91c1c" text-anchor="middle">${serialStr}</text>
  </g>

  <!-- Hardcoded Fine Print Notice: Shred Date / Valid Forever ∞ -->
  <text x="35" y="${height - 20}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${batchColor}" fill-opacity="0.9">${finePrintNotice}</text>
</svg>`;
};
