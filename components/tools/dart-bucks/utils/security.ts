export const MONTH_NAMES_SHORT = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

export const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Generate Date-Stamped Batch ID (e.g. JUL26-B8A3F1)
export const generateBatchId = (customPrefix = ""): string => {
  const now = new Date();
  const monthCode = MONTH_NAMES_SHORT[now.getMonth()];
  const yearCode = now.getFullYear().toString().slice(-2);
  const randomHash = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  if (customPrefix) {
    return `${monthCode}${yearCode}-${customPrefix.toUpperCase()}-${randomHash}`;
  }
  return `${monthCode}${yearCode}-${randomHash}`;
};

export const calculateChecksum = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase();
  return hex.padStart(2, "0").slice(-2);
};

export const getSerialString = (
  prefix: string,
  batchId: string,
  serialNum: number,
  digits = 4,
  includeChecksum = true
): string => {
  const p = prefix ? `${prefix.trim().toUpperCase()}-` : "";
  const b = batchId ? `${batchId.trim().toUpperCase()}-` : "";
  const s = String(serialNum).padStart(digits, "0");
  const raw = `${p}${b}${s}`;

  if (!includeChecksum) return raw;
  const checksum = calculateChecksum(raw);
  return `${raw}-${checksum}`;
};

export const isLightBg = (hexColor: string): boolean => {
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) return true;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance > 140;
};

export const computeBreakdown = (
  targetVal: number,
  weighting: "balanced" | "heavy" | "light" | "custom"
): { bill20: number; bill10: number; bill5: number; bill1: number } => {
  let remaining = Math.max(0, targetVal);

  if (weighting === "heavy") {
    const b20 = Math.floor(remaining / 20);
    remaining %= 20;
    const b10 = Math.floor(remaining / 10);
    remaining %= 10;
    const b5 = Math.floor(remaining / 5);
    remaining %= 5;
    const b1 = Math.floor(remaining);
    return { bill20: b20, bill10: b10, bill5: b5, bill1: b1 };
  }

  if (weighting === "light") {
    let b20 = 0;
    let b10 = 0;
    let b5 = 0;
    let b1 = 0;

    if (remaining >= 100) {
      b20 = Math.floor((remaining * 0.4) / 20);
      remaining -= b20 * 20;
    }

    b10 = Math.floor((remaining * 0.3) / 10);
    remaining -= b10 * 10;

    b5 = Math.floor((remaining * 0.4) / 5);
    remaining -= b5 * 5;

    b1 = Math.floor(remaining);
    return { bill20: b20, bill10: b10, bill5: b5, bill1: b1 };
  }

  // Balanced default
  let b20 = 0;
  let b10 = 0;
  let b5 = 0;
  let b1 = 0;

  if (remaining >= 100) {
    b20 = Math.floor((remaining * 0.6) / 20);
    remaining -= b20 * 20;
  }

  b10 = Math.floor((remaining * 0.5) / 10);
  remaining -= b10 * 10;

  b5 = Math.floor((remaining * 0.5) / 5);
  remaining -= b5 * 5;

  b1 = Math.floor(remaining);
  return { bill20: b20, bill10: b10, bill5: b5, bill1: b1 };
};
