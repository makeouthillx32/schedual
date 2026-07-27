export interface DenomArtSlot {
  denom: "1" | "5" | "10" | "20";
  title: string;
  artist_name: string;
  image_url: string | null;
}

export interface DenominationStyle {
  value: string;
  label: string;
  bg: string;
  border: string;
  accent: string;
  circleBg: string;
}

export const DENOMINATIONS: Record<string, DenominationStyle> = {
  "1": { value: "1", label: "$1 Bill", bg: "#fef9c3", border: "#db2777", accent: "#db2777", circleBg: "#fffdf0" },
  "5": { value: "5", label: "$5 Bill", bg: "#fbcfe8", border: "#be185d", accent: "#be185d", circleBg: "#fff0f3" },
  "10": { value: "10", label: "$10 Bill", bg: "#fef08a", border: "#b45309", accent: "#b45309", circleBg: "#fffde8" },
  "20": { value: "20", label: "$20 Bill", bg: "#bbf7d0", border: "#15803d", accent: "#15803d", circleBg: "#f0fdf4" },
};

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export interface DartBuckConfig {
  mode: "single" | "drawer";
  drawerAmount: number;
  drawerWeighting: "balanced" | "heavy" | "light" | "custom";
  drawerBreakdown: { bill20: number; bill10: number; bill5: number; bill1: number };
  stationPrefix: string;
  batchId: string;
  startSerial: number;
  cardCount: number;
  digits: number;
  includeChecksum: boolean;
  theme: "monopoly" | "custom";
  denomination: string;
  watermarkMode: "auto" | "dark" | "light" | "none";
  showPresetBorders: boolean;
  showPresetText: boolean;
  showWatermark: boolean;
  includeDuplexBacks: boolean;
  previewView: "card" | "sheet-front" | "sheet-back";
  serialPosition: "bottom" | "top" | "bottom-right";
}
