export const calculateChecksum = (batchStr: string, serialNum: number): string => {
  let sum = 0;
  const combined = `${batchStr}${serialNum}`;
  for (let i = 0; i < combined.length; i++) {
    sum = (sum * 31 + combined.charCodeAt(i)) % 256;
  }
  return sum.toString(16).padStart(2, "0").toUpperCase();
};

export const getSerialString = (
  stationPrefix: string,
  batchId: string,
  serialNum: number,
  digits = 4,
  includeChecksum = true
): string => {
  const padded = serialNum.toString().padStart(digits, "0");
  const checksumStr = includeChecksum
    ? `-${calculateChecksum(batchId, serialNum)}`
    : "";
  const prefix = stationPrefix.trim()
    ? `${stationPrefix.trim()}-`
    : "";
  return `${prefix}${batchId}-${padded}${checksumStr}`;
};

export const generateBatchId = (): string => {
  return Math.floor(0x100000 + Math.random() * 0xefffff)
    .toString(16)
    .toUpperCase();
};

export const isLightBg = (hexColor: string): boolean => {
  let hex = hexColor.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  const r = parseInt(hex.substring(0, 2), 16) || 240;
  const g = parseInt(hex.substring(2, 4), 16) || 240;
  const b = parseInt(hex.substring(4, 6), 16) || 240;

  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance > 140;
};

export const computeBreakdown = (amount: number, weighting: "balanced" | "heavy" | "light") => {
  let remaining = Math.max(0, amount);
  let b20 = 0;
  let b10 = 0;
  let b5 = 0;
  let b1 = 0;

  if (weighting === "heavy") {
    b20 = Math.floor(remaining / 20);
    remaining %= 20;
    b10 = Math.floor(remaining / 10);
    remaining %= 10;
    b5 = Math.floor(remaining / 5);
    remaining %= 5;
    b1 = remaining;
  } else if (weighting === "light") {
    b1 = Math.min(20, remaining);
    remaining -= b1;
    b5 = Math.min(10, Math.floor(remaining / 5));
    remaining -= b5 * 5;
    b10 = Math.min(5, Math.floor(remaining / 10));
    remaining -= b10 * 10;
    b20 = Math.floor(remaining / 20);
    remaining %= 20;
    b1 += remaining;
  } else {
    b20 = Math.floor((remaining * 0.7) / 20);
    remaining -= b20 * 20;
    b10 = Math.floor((remaining * 0.6) / 10);
    remaining -= b10 * 10;
    b5 = Math.floor(remaining / 5);
    remaining -= b5 * 5;
    b1 = remaining;
  }

  return { bill20: b20, bill10: b10, bill5: b5, bill1: b1 };
};
