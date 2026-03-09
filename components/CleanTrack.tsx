import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/app/provider";
import { CheckCircle2, Circle, ArrowRight, RefreshCw, Calendar, Check, X, Plus, Search, FileDown, FileSpreadsheet, Printer, ChevronDown } from "lucide-react";
import UniversalExportButton, { ExportTemplate } from "@/components/UniversalExportButton";
import { CMSBillingTemplate, BusinessCleaningRecord } from "@/lib/CMSBillingTemplate";
import * as XLSX from "sheetjs-style";

interface CleanTrackItem {
  id?: number;
  business_id: number;
  business_name: string;
  address: string;
  before_open: boolean;
  status: "pending" | "cleaned" | "missed" | "moved";
  cleaned_at?: string;
  moved_to_date?: string;
  notes?: string;
  marked_by?: string;
  updated_at?: string;
  is_added?: boolean;
}

interface DailyInstance {
  id: number;
  instance_date: string;
  week_number: number;
  day_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AvailableBusiness {
  id: number;
  business_name: string;
  address: string;
  before_open: boolean;
}

interface CleanTrackProps {
  cleanTrack: CleanTrackItem[];
  currentInstance: DailyInstance | null;
  currentDay: string;
  week: number;
  instanceLoading: boolean;
  onToggleBusinessStatus: (businessId: number) => void;
  onMoveBusinessToDate: (businessId: number, date: string) => void;
  onRefreshInstance: () => void;
  onAddBusiness: (businessId: number, notes?: string) => void;
}

function getPacificTimeDate(): Date {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
}

function getLocalDate(): string {
  const pacificTime = getPacificTimeDate();
  const year = pacificTime.getFullYear();
  const month = String(pacificTime.getMonth() + 1).padStart(2, "0");
  const day = String(pacificTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ─── Daily Notes helper (reads from DailyNotes localStorage) ───────────────

type FieldNote = { id: string; text: string; category: string; createdAt: string };

const CATEGORY_LABELS: Record<string, string> = {
  general:  "General",
  contract: "Contract Change",
  client:   "Client Issue",
  followup: "Follow-Up Needed",
};

function getDailyNotes(): FieldNote[] {
  try {
    const now = new Date();
    const pt = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    const key = `daily-notes-${pt.getFullYear()}-${String(pt.getMonth() + 1).padStart(2, "0")}-${String(pt.getDate()).padStart(2, "0")}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// ─── Daily Export Generators ───────────────────────────────────────────────

function generateDailyExcelBlob(items: CleanTrackItem[], instance: DailyInstance | null): Blob {
  const wb = XLSX.utils.book_new();
  const pt = getPacificTimeDate();
  const dateStr = pt.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const dayName = instance?.day_name
    ? instance.day_name.charAt(0).toUpperCase() + instance.day_name.slice(1)
    : pt.toLocaleDateString("en-US", { weekday: "long" });

  const wsData: any[][] = [
    [`DART COMMERCIAL SERVICES — DAILY CLEAN REPORT`],
    [],
    [`Date: ${dateStr}`],
    [`Day: ${dayName}   Instance: #${instance?.id ?? "—"}   Generated: ${new Date().toLocaleTimeString()}`],
    [],
    ["#", "Business", "Address", "Timing", "Status", "Cleaned At", "Moved To", "Added?", "Notes"],
  ];

  items.forEach((item, idx) => {
    wsData.push([
      idx + 1,
      item.business_name,
      item.address || "",
      item.before_open ? "Before Open" : "After Close",
      item.status.charAt(0).toUpperCase() + item.status.slice(1),
      item.cleaned_at ? new Date(item.cleaned_at).toLocaleTimeString() : "",
      item.moved_to_date ? new Date(item.moved_to_date + "T00:00:00").toLocaleDateString() : "",
      item.is_added ? "Yes" : "",
      item.notes || "",
    ]);
  });

  // Summary rows
  const cleaned = items.filter((i) => i.status === "cleaned").length;
  const moved = items.filter((i) => i.status === "moved").length;
  const pending = items.filter((i) => i.status === "pending").length;
  const added = items.filter((i) => i.is_added).length;

  wsData.push(
    [],
    ["SUMMARY"],
    ["Total Businesses", items.length],
    ["Cleaned", cleaned],
    ["Pending", pending],
    ["Moved", moved],
    ["Added On-the-Fly", added],
    ["Completion Rate", items.length > 0 ? `${Math.round((cleaned / items.length) * 100)}%` : "0%"]
  );

  // Field notes from DailyNotes tab
  const fieldNotes = getDailyNotes();
  if (fieldNotes.length > 0) {
    wsData.push([], ["FIELD NOTES"], ["Category", "Note", "Time"]);
    fieldNotes.forEach((n) => {
      wsData.push([
        CATEGORY_LABELS[n.category] ?? n.category,
        n.text,
        new Date(n.createdAt).toLocaleTimeString("en-US", {
          hour: "numeric", minute: "2-digit", hour12: true,
          timeZone: "America/Los_Angeles",
        }),
      ]);
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws["!cols"] = [
    { wch: 4 },  // #
    { wch: 32 }, // Business
    { wch: 30 }, // Address
    { wch: 14 }, // Timing
    { wch: 12 }, // Status
    { wch: 12 }, // Cleaned At
    { wch: 12 }, // Moved To
    { wch: 8 },  // Added
    { wch: 36 }, // Notes
  ];

  // Style header row (row index 5 = 0-based)
  const headerRowIdx = 5;
  const cols = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
  cols.forEach((col) => {
    const addr = `${col}${headerRowIdx + 1}`;
    if (ws[addr]) {
      ws[addr].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1E293B" } },
        alignment: { horizontal: "center" },
      };
    }
  });

  // Style data rows
  items.forEach((item, idx) => {
    const rowNum = headerRowIdx + 2 + idx; // 1-based sheet row
    const statusCell = `E${rowNum}`;
    if (ws[statusCell]) {
      const color =
        item.status === "cleaned" ? "16A34A" :
        item.status === "moved"   ? "D97706" :
        item.status === "pending" ? "6B7280" : "DC2626";
      ws[statusCell].s = { font: { bold: true, color: { rgb: color } } };
    }
  });

  // Title style
  if (ws["A1"]) {
    ws["A1"].s = { font: { bold: true, size: 14, color: { rgb: "1E293B" } } };
  }

  // Merge title across columns
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 8 } },
  ];

  ws["!pageSetup"] = { paperSize: 1, orientation: "landscape", fitToWidth: 1 };

  XLSX.utils.book_append_sheet(wb, ws, "Daily Report");
  const arrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true });
  return new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function generateDailyHTML(items: CleanTrackItem[], instance: DailyInstance | null): string {
  const pt = getPacificTimeDate();
  const dateStr = pt.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const cleaned = items.filter((i) => i.status === "cleaned").length;
  const moved = items.filter((i) => i.status === "moved").length;
  const pending = items.filter((i) => i.status === "pending").length;
  const added = items.filter((i) => i.is_added).length;
  const fieldNotes = getDailyNotes();

  const CATEGORY_COLORS: Record<string, string> = {
    general:  "#6b7280",
    contract: "#d97706",
    client:   "#dc2626",
    followup: "#2563eb",
  };

  const statusColor = (s: string) =>
    s === "cleaned" ? "#16a34a" : s === "moved" ? "#d97706" : s === "pending" ? "#6b7280" : "#dc2626";

  const rows = items
    .map(
      (item, idx) => `
      <tr style="background:${idx % 2 === 0 ? "#fff" : "#f8fafc"}; border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 10px; color:#64748b; font-size:12px;">${idx + 1}</td>
        <td style="padding:8px 10px; font-weight:600; font-size:13px;">${item.business_name}${item.is_added ? ' <span style="font-size:10px;font-weight:700;color:#2563eb;background:#dbeafe;padding:1px 6px;border-radius:999px;vertical-align:middle;">Added</span>' : ""}</td>
        <td style="padding:8px 10px; font-size:12px; color:#64748b;">${item.address || "—"}</td>
        <td style="padding:8px 10px; font-size:11px;">
          <span style="padding:2px 8px;border-radius:999px;background:${item.before_open ? "#fee2e2" : "#dcfce7"};color:${item.before_open ? "#dc2626" : "#16a34a"};font-weight:600;">
            ${item.before_open ? "Before Open" : "After Close"}
          </span>
        </td>
        <td style="padding:8px 10px;">
          <span style="padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;background:${statusColor(item.status)}22;color:${statusColor(item.status)};border:1px solid ${statusColor(item.status)}55;">
            ${item.status}
          </span>
        </td>
        <td style="padding:8px 10px; font-size:12px; color:#64748b;">${item.cleaned_at ? new Date(item.cleaned_at).toLocaleTimeString() : item.moved_to_date ? `→ ${new Date(item.moved_to_date + "T00:00:00").toLocaleDateString()}` : "—"}</td>
        <td style="padding:8px 10px; font-size:12px; color:#64748b; font-style:italic;">${item.notes || "—"}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><title>Daily Report – ${dateStr}</title>
  <style>
    body { font-family: Georgia, serif; padding: 40px; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; }
    @media print { body { padding: 20px; } }
  </style>
  </head><body>
    <div style="border-bottom:3px solid #1e293b;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end;">
      <div>
        <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;">DART Commercial Services</div>
        <div style="font-size:14px;color:#475569;margin-top:2px;">Daily Clean Report</div>
      </div>
      <div style="text-align:right;font-size:13px;color:#475569;">
        <div style="font-weight:700;color:#1e293b;font-size:15px;">${dateStr}</div>
        <div>Instance #${instance?.id ?? "—"}</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px;">
      ${[
        { label: "Cleaned", count: cleaned, color: "#16a34a" },
        { label: "Pending", count: pending, color: "#6b7280" },
        { label: "Moved",   count: moved,   color: "#d97706" },
        { label: "Added",   count: added,   color: "#2563eb" },
      ]
        .map(
          ({ label, count, color }) =>
            `<div style="border:2px solid ${color};border-radius:8px;padding:10px 14px;text-align:center;">
              <div style="font-size:26px;font-weight:800;color:${color};">${count}</div>
              <div style="font-size:11px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:1px;">${label}</div>
            </div>`
        )
        .join("")}
    </div>

    <table>
      <thead>
        <tr style="background:#1e293b;">
          ${["#","Business","Address","Timing","Status","Time / Moved To","Notes"]
            .map((h) => `<th style="padding:10px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#fff;font-weight:700;">${h}</th>`)
            .join("")}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    ${fieldNotes.length > 0 ? `
    <div style="margin-top:36px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;margin-bottom:12px;">Field Notes & Updates</div>
      <table>
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#475569;border-bottom:2px solid #cbd5e1;white-space:nowrap;">Category</th>
            <th style="padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#475569;border-bottom:2px solid #cbd5e1;">Note</th>
            <th style="padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#475569;border-bottom:2px solid #cbd5e1;white-space:nowrap;">Time</th>
          </tr>
        </thead>
        <tbody>
          ${fieldNotes.map((n, i) => {
            const color = CATEGORY_COLORS[n.category] ?? "#6b7280";
            const time = new Date(n.createdAt).toLocaleTimeString("en-US", {
              hour: "numeric", minute: "2-digit", hour12: true,
              timeZone: "America/Los_Angeles",
            });
            return `<tr style="background:${i % 2 === 0 ? "#fff" : "#f8fafc"};border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 10px;white-space:nowrap;">
                <span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;
                  background:${color}22;color:${color};border:1px solid ${color}55;text-transform:uppercase;letter-spacing:.5px;">
                  ${CATEGORY_LABELS[n.category] ?? n.category}
                </span>
              </td>
              <td style="padding:8px 10px;font-size:13px;color:#1e293b;">${n.text}</td>
              <td style="padding:8px 10px;font-size:12px;color:#64748b;white-space:nowrap;">${time}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>` : ""}

    <div style="margin-top:48px;border-top:2px solid #1e293b;padding-top:20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px;">
      ${["Technician Signature", "Supervisor Review", "Date Submitted"]
        .map(
          (l) =>
            `<div>
              <div style="border-bottom:1px solid #94a3b8;height:32px;"></div>
              <div style="font-size:10px;color:#94a3b8;margin-top:4px;text-transform:uppercase;letter-spacing:1px;">${l}</div>
            </div>`
        )
        .join("")}
    </div>

    <div style="margin-top:24px;font-size:10px;color:#94a3b8;text-align:center;">
      DART Commercial Services · Confidential · ${getLocalDate()}
    </div>
  </body></html>`;
}

// ──────────────────────────────────────────────────────────────────────────

export default function CleanTrack({
  cleanTrack,
  currentInstance,
  currentDay,
  week,
  instanceLoading,
  onToggleBusinessStatus,
  onMoveBusinessToDate,
  onRefreshInstance,
  onAddBusiness,
}: CleanTrackProps) {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  const [movingBusiness, setMovingBusiness] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [billingData, setBillingData] = useState<BusinessCleaningRecord[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => getPacificTimeDate().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(() => getPacificTimeDate().getFullYear());

  const [showDailyDropdown, setShowDailyDropdown] = useState(false);
  const dailyDropdownRef = useRef<HTMLDivElement>(null);

  // Close daily dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dailyDropdownRef.current && !dailyDropdownRef.current.contains(e.target as Node)) {
        setShowDailyDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [availableBusinesses, setAvailableBusinesses] = useState<AvailableBusiness[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBusinessToAdd, setSelectedBusinessToAdd] = useState<AvailableBusiness | null>(null);
  const [addBusinessNotes, setAddBusinessNotes] = useState("");

  const completed = cleanTrack.filter((item) => item.status === "cleaned").length;
  const moved = cleanTrack.filter((item) => item.status === "moved").length;
  const pending = cleanTrack.filter((item) => item.status === "pending").length;
  const added = cleanTrack.filter((item) => item.is_added).length;

  useEffect(() => {
    loadBillingData();
    loadAvailableBusinesses();
  }, [currentInstance]);

  const loadAvailableBusinesses = async () => {
    try {
      const res = await fetch("/api/schedule/businesses");
      if (res.ok) {
        const businesses = await res.json();
        const currentBusinessIds = new Set(cleanTrack.map((item) => item.business_id));
        setAvailableBusinesses(businesses.filter((b: any) => !currentBusinessIds.has(b.id)));
      }
    } catch (error) {
      console.error("Error loading available businesses:", error);
    }
  };

  const loadBillingData = async () => {
    if (!currentInstance) return;
    try {
      const pt = getPacificTimeDate();
      const month = pt.getMonth() + 1;
      const year = pt.getFullYear();
      setCurrentMonth(month);
      setCurrentYear(year);

      const startDateStr = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0);
      const endDateStr = `${year}-${String(month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

      const [businessesRes, instancesRes] = await Promise.all([
        fetch("/api/schedule/businesses"),
        fetch(`/api/schedule/daily-instances/monthly?start_date=${startDateStr}&end_date=${endDateStr}`),
      ]);

      if (!businessesRes.ok || !instancesRes.ok) throw new Error("Failed to fetch data");

      const allBusinesses = await businessesRes.json();
      const monthlyData = await instancesRes.json();

      const businessRecords = new Map<number, BusinessCleaningRecord>();
      allBusinesses.forEach((business: any) => {
        businessRecords.set(business.id, {
          business_id: business.id,
          business_name: business.business_name,
          address: business.address,
          cleaned_dates: [],
          moved_dates: [],
          added_dates: [],
        });
      });

      monthlyData.instances?.forEach((instance: any) => {
        const dayOfMonth = parseInt(instance.instance_date.split("-")[2], 10);
        instance.daily_clean_items?.forEach((item: any) => {
          const record = businessRecords.get(item.business_id);
          if (record) {
            if (item.status === "cleaned" && !record.cleaned_dates.includes(dayOfMonth))
              record.cleaned_dates.push(dayOfMonth);
            if (item.status === "moved" && !record.moved_dates.includes(dayOfMonth))
              record.moved_dates.push(dayOfMonth);
            if (item.is_added && item.status === "cleaned" && !record.added_dates.includes(dayOfMonth))
              record.added_dates.push(dayOfMonth);
          }
        });
      });

      setBillingData(
        Array.from(businessRecords.values()).sort((a, b) =>
          a.business_name.localeCompare(b.business_name)
        )
      );
    } catch (error) {
      console.error("Error loading billing data:", error);
    }
  };

  const handleMoveClick = (businessId: number) => {
    setMovingBusiness(businessId);
    setSelectedDate("");
  };

  const handleDateConfirm = () => {
    if (movingBusiness && selectedDate) {
      onMoveBusinessToDate(movingBusiness, selectedDate);
      setMovingBusiness(null);
      setSelectedDate("");
    }
  };

  const handleCancelMove = () => {
    setMovingBusiness(null);
    setSelectedDate("");
  };

  const handleAddBusinessClick = () => {
    setShowAddBusiness(true);
    setSearchTerm("");
    setSelectedBusinessToAdd(null);
    setAddBusinessNotes("");
    loadAvailableBusinesses();
  };

  const handleCancelAdd = () => {
    setShowAddBusiness(false);
    setSearchTerm("");
    setSelectedBusinessToAdd(null);
    setAddBusinessNotes("");
  };

  const handleConfirmAdd = () => {
    if (selectedBusinessToAdd) {
      onAddBusiness(
        selectedBusinessToAdd.id,
        addBusinessNotes.trim() || "Added on-the-fly - moved from another day"
      );
      handleCancelAdd();
    }
  };

  const filteredBusinesses = availableBusinesses.filter(
    (b) =>
      b.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "cleaned": return <CheckCircle2 size={20} className="text-green-600" />;
      case "moved":   return <ArrowRight size={20} className="text-yellow-600" />;
      default:        return <Circle size={20} className="text-[hsl(var(--muted-foreground))]" />;
    }
  };

  const getStatusText = (item: CleanTrackItem) => {
    switch (item.status) {
      case "cleaned":
        return (
          <span className="text-green-600 font-medium">
            ✓ Cleaned {item.cleaned_at && `at ${new Date(item.cleaned_at).toLocaleTimeString()}`}
          </span>
        );
      case "moved":
        return (
          <span className="text-yellow-600 font-medium">
            → Moved to {item.moved_to_date && new Date(item.moved_to_date).toLocaleDateString()}
          </span>
        );
      default:
        return <span className="text-[hsl(var(--muted-foreground))]">Pending</span>;
    }
  };

  const getMonthName = () =>
    ["January","February","March","April","May","June","July","August","September","October","November","December"][currentMonth - 1] || "";

  // ─── Export templates ────────────────────────────────────────────────────

  const billingTemplate: ExportTemplate = {
    id: "cms-billing-unified",
    name: "Monthly Billing",
    data: {
      month: currentMonth,
      year: currentYear,
      instance_info: currentInstance
        ? { id: currentInstance.id, date: currentInstance.instance_date, day: currentInstance.day_name }
        : null,
    },
    generator: async (data, format) => {
      const { month, year } = data;
      const template = new CMSBillingTemplate(month, year);
      await template.fetchCleaningData();
      if (format === "excel") {
        const arrayBuffer = template.generateExcel();
        return new Blob([arrayBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else {
        return template.generateHTML();
      }
    },
  };

  // ────────────────────────────────────────────────────────────────────────

  return (
    <div
      className={`rounded-lg p-4 ${
        isDark
          ? "bg-[hsl(var(--card))] shadow-[var(--shadow-md)]"
          : "bg-[hsl(var(--background))] shadow-[var(--shadow-sm)]"
      }`}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <CheckCircle2 size={24} className="mr-2 text-[hsl(var(--sidebar-primary))]" />
            Clean Track - {currentDay.charAt(0).toUpperCase() + currentDay.slice(1)}
          </h3>
          <div className="flex items-center space-x-2">
            {currentInstance && (
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Instance #{currentInstance.id}
              </div>
            )}
            <button
              onClick={handleAddBusinessClick}
              className="px-3 py-1 text-sm bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors flex items-center"
            >
              <Plus size={14} className="mr-1" />
              Add Business
            </button>
            <button
              onClick={onRefreshInstance}
              disabled={instanceLoading}
              className="p-2 hover:bg-[hsl(var(--secondary))] rounded transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={16} className={instanceLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {currentInstance && (
          <div className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
            <div className="flex items-center space-x-4">
              <span>📅 {getPacificTimeDate().toLocaleDateString()}</span>
              <span>👥 Shared with team</span>
              <span>🔄 Last updated: {new Date(currentInstance.updated_at).toLocaleTimeString()}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-4">
          {[
            { label: "Cleaned", value: completed, color: "text-green-600" },
            { label: "Pending", value: pending,   color: "text-[hsl(var(--muted-foreground))]" },
            { label: "Moved",   value: moved,     color: "text-yellow-600" },
            { label: "Added",   value: added,     color: "text-blue-600" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className={`p-3 rounded-lg text-center ${
                isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"
              }`}
            >
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Business Modal */}
      {showAddBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md mx-4 rounded-lg p-6 ${isDark ? "bg-[hsl(var(--card))]" : "bg-white"}`}>
            <h4 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">
              Add Business to Today's Cleaning
            </h4>
            <div className="mb-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[hsl(var(--border))] rounded bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto mb-4 border border-[hsl(var(--border))] rounded">
              {filteredBusinesses.length > 0 ? (
                filteredBusinesses.map((business) => (
                  <button
                    key={business.id}
                    onClick={() => setSelectedBusinessToAdd(business)}
                    className={`w-full p-3 text-left border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent))] transition-colors ${
                      selectedBusinessToAdd?.id === business.id ? "bg-[hsl(var(--accent))]" : ""
                    }`}
                  >
                    <div className="font-medium text-[hsl(var(--foreground))]">{business.business_name}</div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">{business.address}</div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                        business.before_open
                          ? "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]"
                          : "bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]"
                      }`}
                    >
                      {business.before_open ? "Before Open" : "After Close"}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-[hsl(var(--muted-foreground))]">No businesses found</div>
              )}
            </div>
            {selectedBusinessToAdd && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-[hsl(var(--foreground))]">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Moved from another day, Extra cleaning"
                  value={addBusinessNotes}
                  onChange={(e) => setAddBusinessNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
                />
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={handleCancelAdd}
                className="flex-1 px-4 py-2 border border-[hsl(var(--border))] rounded text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdd}
                disabled={!selectedBusinessToAdd}
                className={`flex-1 px-4 py-2 bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors flex items-center justify-center ${
                  !selectedBusinessToAdd ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Plus size={16} className="mr-1" />
                Add to Track
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Business list */}
      <div className="space-y-3">
        {cleanTrack.map((item) => (
          <div
            key={item.business_id}
            className={`p-4 rounded-lg border border-[hsl(var(--border))] transition-all ${
              isDark ? "bg-[hsl(var(--card))]" : "bg-[hsl(var(--background))]"
            } ${
              item.status === "cleaned"
                ? "border-green-200 bg-green-50/50"
                : item.status === "moved"
                ? "border-yellow-200 bg-yellow-50/50"
                : item.is_added
                ? "border-blue-200 bg-blue-50/50"
                : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <button
                  onClick={() => onToggleBusinessStatus(item.business_id)}
                  className="mt-1 hover:scale-110 transition-transform"
                  disabled={item.status === "moved"}
                >
                  {getStatusIcon(item.status)}
                </button>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-[hsl(var(--foreground))]">{item.business_name}</h4>
                    {item.is_added && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Added</span>
                    )}
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{item.address}</p>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.before_open
                          ? "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]"
                          : "bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]"
                      }`}
                    >
                      {item.before_open ? "Before Open" : "After Close"}
                    </span>
                    {getStatusText(item)}
                  </div>
                  {item.notes && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 italic">📝 {item.notes}</p>
                  )}
                </div>
              </div>

              {item.status === "pending" && (
                <div className="flex items-center space-x-2">
                  {movingBusiness === item.business_id ? (
                    <div className="flex items-center space-x-2 animate-in slide-in-from-right-2">
                      <Calendar size={16} className="text-[hsl(var(--muted-foreground))]" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-2 py-1 text-sm border border-[hsl(var(--border))] rounded bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
                        min={getLocalDate()}
                        autoFocus
                      />
                      <button
                        onClick={handleDateConfirm}
                        disabled={!selectedDate}
                        className={`p-2 rounded transition-colors ${
                          selectedDate
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                        }`}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={handleCancelMove}
                        className="p-2 bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded hover:bg-[hsl(var(--secondary))] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMoveClick(item.business_id)}
                      className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                    >
                      Move
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer with both exports */}
      <div className="mt-6 p-4 border-t border-[hsl(var(--border))]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            Progress: {completed} of {cleanTrack.length} completed
            {moved > 0 && ` • ${moved} moved`}
            {added > 0 && ` • ${added} added`}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Daily export — scoped to today's cleanTrack only */}
            {cleanTrack.length > 0 && (
              <div className="relative inline-block" ref={dailyDropdownRef}>
                <button
                  onClick={() => setShowDailyDropdown((v) => !v)}
                  disabled={instanceLoading}
                  className="px-4 py-2 text-sm font-medium rounded border border-[hsl(var(--border))] bg-transparent text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <FileDown size={15} />
                  Export Today
                  <ChevronDown size={13} />
                </button>
                {showDailyDropdown && (
                  <div className={`absolute bottom-full mb-1 left-0 w-52 rounded-md shadow-lg z-50 border border-[hsl(var(--border))] ${isDark ? "bg-[hsl(var(--card))]" : "bg-white"}`}>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowDailyDropdown(false);
                          const blob = generateDailyExcelBlob(cleanTrack, currentInstance);
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `DART_Daily_Report_${getLocalDate()}.xlsx`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-[hsl(var(--accent))] transition-colors ${isDark ? "text-[hsl(var(--foreground))]" : "text-gray-700"}`}
                      >
                        <FileSpreadsheet size={15} className="text-green-600" />
                        Download Excel (.xlsx)
                      </button>
                      <button
                        onClick={() => {
                          setShowDailyDropdown(false);
                          const html = generateDailyHTML(cleanTrack, currentInstance);
                          const win = window.open("", "_blank");
                          if (!win) return;
                          win.document.write(html);
                          win.document.close();
                          win.focus();
                          win.print();
                        }}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-[hsl(var(--accent))] transition-colors ${isDark ? "text-[hsl(var(--foreground))]" : "text-gray-700"}`}
                      >
                        <Printer size={15} className="text-blue-600" />
                        Print / Save PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Monthly billing export — only when billing data is loaded */}
            {billingData.length > 0 && currentInstance && (
              <>
                <button
                  onClick={loadBillingData}
                  className="px-3 py-1 text-sm bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded hover:bg-[hsl(var(--secondary))]/80 transition-colors"
                  title="Refresh billing data"
                >
                  🔄 Refresh
                </button>
                <UniversalExportButton
                  template={billingTemplate}
                  filename={`CMS_Billing_${getMonthName()}_${currentYear}`}
                  disabled={instanceLoading}
                  size="md"
                  variant="primary"
                />
              </>
            )}
          </div>
        </div>

        {billingData.length > 0 && (
          <div className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            💡 Monthly export includes all {billingData.length} businesses for {getMonthName()} {currentYear}
          </div>
        )}
      </div>
    </div>
  );
}