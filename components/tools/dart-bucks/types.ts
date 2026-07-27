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

export type PaperSizePreset = "letter" | "a4" | "11x12-14" | "11x12-21";

export interface PaperSpec {
  id: PaperSizePreset;
  label: string;
  widthMm: number;
  heightMm: number;
  cols: number;
  rows: number;
  billsPerSheet: number;
}

export const PAPER_SPECS: Record<PaperSizePreset, PaperSpec> = {
  "letter": { id: "letter", label: 'US Letter (8.5" × 11")', widthMm: 215.9, heightMm: 279.4, cols: 2, rows: 6, billsPerSheet: 12 },
  "a4": { id: "a4", label: "A4 Sheet (210 × 297 mm)", widthMm: 210.0, heightMm: 297.0, cols: 2, rows: 6, billsPerSheet: 12 },
  "11x12-14": { id: "11x12-14", label: 'Custom 11" × 12" (14 Bills)', widthMm: 279.4, heightMm: 304.8, cols: 2, rows: 7, billsPerSheet: 14 },
  "11x12-21": { id: "11x12-21", label: 'Custom 11" × 12" (21 Bills)', widthMm: 279.4, heightMm: 304.8, cols: 3, rows: 7, billsPerSheet: 21 },
};

export interface BatchLogItem {
  id: string;
  batch_id: string;
  station_prefix: string;
  issuer_name: string;
  issuer_role: string;
  department: string;
  mode: "single" | "drawer";
  drawer_amount: number;
  total_bills_count: number;
  itemized_breakdown: { bill20: number; bill10: number; bill5: number; bill1: number };
  serial_start: string;
  serial_end: string;
  issue_reason: string;
  printed_at: string;
  status: "active" | "completed" | "shredded";
  completed_at?: string;
  shredded_at?: string;
}

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
  paperSize: PaperSizePreset;
  includeCropMarks: boolean;
  bleedMm: number;
  gutterMm: number;
  previewView: "card" | "sheet-front" | "sheet-back";
  serialPosition: "bottom" | "top" | "bottom-right";
  validityMode: "forever" | "expires";
  expirationDate: string;
}
