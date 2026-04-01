// lib/DeliveryExportTemplate.ts
// Monthly delivery & trash run export — mirrors the CMSBillingTemplate pattern.
// Used by the ExportButton in the DriverBoard.

import { SupabaseClient } from "@supabase/supabase-js";
import * as XLSX from "sheetjs-style";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DeliveryRecord {
  id:                      string;
  customer_name:           string;
  customer_phone:          string | null;
  order_type:              "delivery" | "pickup";
  status:                  string;
  item_description:        string;
  item_notes:              string | null;
  origin_address:          string | null;
  destination_address:     string | null;
  scheduled_date:          string | null;
  scheduled_time:          string | null;
  scheduled_time_override: string | null;
  taken_by:                string | null;
  completed_at:            string | null;
  payment_status:          string;
}

export interface TrashRunRecord {
  id:           string;
  note:         string | null;
  status:       string;
  created_at:   string;
  completed_at: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function fmtTime(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function fmtDate(d: string | null): string {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
}

function cell(s: XLSX.CellObject["s"]): Pick<XLSX.CellObject, "s"> {
  return { s };
}

// ── Template class ────────────────────────────────────────────────────────────

export class DeliveryExportTemplate {
  private month:    number;
  private year:     number;
  private orders:   DeliveryRecord[]  = [];
  private trash:    TrashRunRecord[]  = [];
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient, month: number, year: number) {
    this.supabase = supabase;
    this.month    = month;
    this.year     = year;
  }

  // ── Fetch ────────────────────────────────────────────────────────────────

  async fetchData(): Promise<void> {
    const start = `${this.year}-${String(this.month).padStart(2, "0")}-01`;
    const endDate = new Date(this.year, this.month, 1); // first day of NEXT month
    const end   = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-01`;

    const [ordersRes, trashRes] = await Promise.all([
      this.supabase
        .from("delivery_orders")
        .select("*")
        .gte("scheduled_date", start)
        .lt("scheduled_date", end)
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time",  { ascending: true }),
      this.supabase
        .from("trash_runs")
        .select("*")
        .gte("created_at", `${start}T00:00:00Z`)
        .lt("created_at",  `${end}T00:00:00Z`)
        .order("created_at", { ascending: true }),
    ]);

    this.orders = (ordersRes.data ?? []) as DeliveryRecord[];
    this.trash  = (trashRes.data  ?? []) as TrashRunRecord[];
  }

  // ── Generate xlsx ────────────────────────────────────────────────────────

  generateExcel(): ArrayBuffer {
    const wb = XLSX.utils.book_new();
    const monthName = MONTHS[this.month - 1];
    const title     = `DART Thrift — Delivery & Pickup Report`;
    const subtitle  = `${monthName} ${this.year}`;
    const generated = `Generated: ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}`;

    // ── Summary stats ──
    const deliveries  = this.orders.filter((o) => o.order_type === "delivery");
    const pickups     = this.orders.filter((o) => o.order_type === "pickup");
    const completed   = this.orders.filter((o) => o.status === "completed");
    const trashDone   = this.trash.filter((t)  => t.status === "done");

    // ── Sheet 1: Summary ──────────────────────────────────────────────────
    const summaryData: any[][] = [
      [title,           "", "", ""],
      [subtitle,        "", "", ""],
      [generated,       "", "", ""],
      [],
      ["SUMMARY",       "",              "",             ""],
      ["Total Orders",  this.orders.length, "Completed", completed.length],
      ["Deliveries",    deliveries.length,  "Pickups",   pickups.length],
      ["Trash Runs",    this.trash.length,  "Completed", trashDone.length],
      [],
      ["Completion Rate",
        this.orders.length > 0
          ? `${Math.round((completed.length / this.orders.length) * 100)}%`
          : "N/A",
        "", ""],
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs["!cols"] = [{ wch: 22 }, { wch: 14 }, { wch: 18 }, { wch: 14 }];
    summaryWs["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 3 } },
      { s: { r: 9, c: 0 }, e: { r: 9, c: 0 } },
    ];

    // Style title
    const styleTitle = { font: { bold: true, sz: 14 }, alignment: { horizontal: "center" } };
    const styleSub   = { font: { sz: 12 }, alignment: { horizontal: "center" } };
    const styleGen   = { font: { sz: 9, color: { rgb: "888888" } }, alignment: { horizontal: "center" } };
    const styleHdr   = { font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "166534" } }, alignment: { horizontal: "center" } };
    const styleLbl   = { font: { bold: true } };
    const styleNum   = { font: { sz: 12, bold: true, color: { rgb: "166534" } } };

    if (summaryWs["A1"]) summaryWs["A1"].s = styleTitle;
    if (summaryWs["A2"]) summaryWs["A2"].s = styleSub;
    if (summaryWs["A3"]) summaryWs["A3"].s = styleGen;
    if (summaryWs["A5"]) summaryWs["A5"].s = styleHdr;
    ["A6","A7","A8","C6","C7","C8"].forEach((addr) => {
      if (summaryWs[addr]) summaryWs[addr].s = styleLbl;
    });
    ["B6","B7","B8","D6","D7","D8","B10"].forEach((addr) => {
      if (summaryWs[addr]) summaryWs[addr].s = styleNum;
    });

    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // ── Sheet 2: Orders ───────────────────────────────────────────────────
    const orderHeaders = [
      "Date", "Time", "Type", "Customer", "Phone",
      "Address", "Items", "Notes", "Status", "Taken By", "Completed At",
    ];

    const orderRows = this.orders.map((o) => {
      const effectiveTime = o.scheduled_time_override ?? o.scheduled_time;
      const addr = o.order_type === "delivery" ? o.destination_address : o.origin_address;
      return [
        fmtDate(o.scheduled_date),
        fmtTime(effectiveTime),
        o.order_type === "delivery" ? "📦 Delivery" : "🚛 Pickup",
        o.customer_name,
        o.customer_phone ?? "",
        addr ?? "",
        o.item_description,
        o.item_notes ?? "",
        o.status.charAt(0).toUpperCase() + o.status.slice(1).replace("_", " "),
        o.taken_by ?? "",
        o.completed_at
          ? new Date(o.completed_at).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
          : "",
      ];
    });

    const ordersWs = XLSX.utils.aoa_to_sheet([orderHeaders, ...orderRows]);
    ordersWs["!cols"] = [
      { wch: 14 }, // Date
      { wch: 10 }, // Time
      { wch: 12 }, // Type
      { wch: 18 }, // Customer
      { wch: 14 }, // Phone
      { wch: 30 }, // Address
      { wch: 28 }, // Items
      { wch: 24 }, // Notes
      { wch: 12 }, // Status
      { wch: 14 }, // Taken By
      { wch: 20 }, // Completed At
    ];

    // Style header row
    const hdrStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "166534" } },
      alignment: { horizontal: "center", wrapText: true },
    };
    orderHeaders.forEach((_, i) => {
      const addr = XLSX.utils.encode_cell({ r: 0, c: i });
      if (ordersWs[addr]) ordersWs[addr].s = hdrStyle;
    });

    // Zebra rows + status coloring
    const statusColors: Record<string, string> = {
      completed:   "166534",
      in_progress: "7c3aed",
      assigned:    "1d4ed8",
      pending:     "b45309",
      cancelled:   "991b1b",
    };
    this.orders.forEach((o, rowIdx) => {
      const r = rowIdx + 1;
      const bg = rowIdx % 2 === 0 ? "FFFFFF" : "F0FDF4";
      const rowStyle = { fill: { fgColor: { rgb: bg } }, alignment: { wrapText: true } };

      orderHeaders.forEach((_, c) => {
        const addr = XLSX.utils.encode_cell({ r, c });
        if (ordersWs[addr]) ordersWs[addr].s = { ...rowStyle };
      });

      // Status cell colored
      const statusAddr = XLSX.utils.encode_cell({ r, c: 8 });
      if (ordersWs[statusAddr]) {
        ordersWs[statusAddr].s = {
          fill: { fgColor: { rgb: bg } },
          font: { bold: true, color: { rgb: statusColors[o.status] ?? "000000" } },
        };
      }
    });

    // Freeze header row
    ordersWs["!freeze"] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(wb, ordersWs, "Orders");

    // ── Sheet 3: Trash Runs ───────────────────────────────────────────────
    const trashHeaders = ["Date", "Time", "Note", "Status", "Completed At"];
    const trashRows = this.trash.map((t) => {
      const d = new Date(t.created_at);
      const pt = new Date(d.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
      return [
        pt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        pt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        t.note ?? "Trash run to dump",
        t.status === "done" ? "✓ Done" : "Pending",
        t.completed_at
          ? new Date(t.completed_at).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
          : "",
      ];
    });

    const trashWs = XLSX.utils.aoa_to_sheet([trashHeaders, ...trashRows]);
    trashWs["!cols"] = [{ wch: 14 }, { wch: 10 }, { wch: 36 }, { wch: 10 }, { wch: 22 }];

    trashHeaders.forEach((_, i) => {
      const addr = XLSX.utils.encode_cell({ r: 0, c: i });
      if (trashWs[addr]) trashWs[addr].s = hdrStyle;
    });

    this.trash.forEach((t, rowIdx) => {
      const r = rowIdx + 1;
      const bg = rowIdx % 2 === 0 ? "FFFFFF" : "F0FDF4";
      trashHeaders.forEach((_, c) => {
        const addr = XLSX.utils.encode_cell({ r, c });
        if (trashWs[addr]) trashWs[addr].s = { fill: { fgColor: { rgb: bg } } };
      });
      const statusAddr = XLSX.utils.encode_cell({ r, c: 3 });
      if (trashWs[statusAddr]) {
        trashWs[statusAddr].s = {
          fill: { fgColor: { rgb: bg } },
          font: { bold: true, color: { rgb: t.status === "done" ? "166534" : "b45309" } },
        };
      }
    });

    trashWs["!freeze"] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(wb, trashWs, "Trash Runs");

    return XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true });
  }

  // ── Generate print HTML ──────────────────────────────────────────────────

  generateHTML(): string {
    const monthName  = MONTHS[this.month - 1];
    const deliveries = this.orders.filter((o) => o.order_type === "delivery");
    const pickups    = this.orders.filter((o) => o.order_type === "pickup");
    const completed  = this.orders.filter((o) => o.status === "completed");
    const trashDone  = this.trash.filter((t)  => t.status === "done");

    const orderRows = this.orders.map((o, i) => {
      const effectiveTime = o.scheduled_time_override ?? o.scheduled_time;
      const addr = o.order_type === "delivery" ? o.destination_address : o.origin_address;
      const bg   = i % 2 === 0 ? "#fff" : "#f0fdf4";
      return `
        <tr style="background:${bg}">
          <td>${fmtDate(o.scheduled_date)}</td>
          <td>${fmtTime(effectiveTime)}</td>
          <td>${o.order_type === "delivery" ? "📦 Delivery" : "🚛 Pickup"}</td>
          <td><strong>${o.customer_name}</strong></td>
          <td>${addr ?? ""}</td>
          <td>${o.item_description}</td>
          <td style="color:${o.status === "completed" ? "#166534" : "#b45309"};font-weight:bold">
            ${o.status.charAt(0).toUpperCase() + o.status.slice(1).replace("_", " ")}
          </td>
          <td>${o.taken_by ?? ""}</td>
        </tr>`;
    }).join("");

    const trashRows = this.trash.map((t, i) => {
      const d  = new Date(t.created_at);
      const pt = new Date(d.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
      const bg = i % 2 === 0 ? "#fff" : "#f0fdf4";
      return `
        <tr style="background:${bg}">
          <td>${pt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</td>
          <td>${pt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</td>
          <td>${t.note ?? "Trash run to dump"}</td>
          <td style="color:${t.status === "done" ? "#166534" : "#b45309"};font-weight:bold">
            ${t.status === "done" ? "✓ Done" : "Pending"}
          </td>
        </tr>`;
    }).join("");

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>DART Thrift — ${monthName} ${this.year}</title>
    <style>
      @page { size: letter; margin: 0.6in; }
      body { font-family: Arial, sans-serif; font-size: 10px; color: #1e293b; }
      h1 { font-size: 18px; margin: 0; color: #166534; }
      h2 { font-size: 13px; margin: 4px 0 0; color: #444; font-weight: normal; }
      .meta { font-size: 9px; color: #888; margin-bottom: 16px; }
      .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 20px; }
      .stat { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px; text-align: center; }
      .stat-n { font-size: 22px; font-weight: bold; color: #166534; }
      .stat-l { font-size: 9px; color: #555; margin-top: 2px; }
      h3 { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: .05em;
           color: #fff; background: #166534; padding: 5px 8px; margin: 16px 0 0; border-radius: 4px 4px 0 0; }
      table { width: 100%; border-collapse: collapse; font-size: 9px; }
      th { background: #166534; color: #fff; padding: 5px 6px; text-align: left; font-weight: bold; }
      td { padding: 4px 6px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
      .footer { margin-top: 24px; font-size: 8px; color: #aaa; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    </style></head><body>
    <h1>DART Thrift — Delivery &amp; Pickup Report</h1>
    <h2>${monthName} ${this.year}</h2>
    <p class="meta">Generated: ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}</p>

    <div class="stats">
      <div class="stat"><div class="stat-n">${this.orders.length}</div><div class="stat-l">Total Orders</div></div>
      <div class="stat"><div class="stat-n">${deliveries.length}</div><div class="stat-l">Deliveries</div></div>
      <div class="stat"><div class="stat-n">${pickups.length}</div><div class="stat-l">Pickups</div></div>
      <div class="stat"><div class="stat-n">${completed.length}</div><div class="stat-l">Completed</div></div>
      <div class="stat"><div class="stat-n">${this.trash.length}</div><div class="stat-l">Trash Runs</div></div>
      <div class="stat"><div class="stat-n">${trashDone.length}</div><div class="stat-l">Trash Done</div></div>
      <div class="stat"><div class="stat-n">${this.orders.length > 0 ? Math.round((completed.length / this.orders.length) * 100) : 0}%</div><div class="stat-l">Completion</div></div>
      <div class="stat"><div class="stat-n">${this.year}</div><div class="stat-l">${monthName}</div></div>
    </div>

    <h3>Orders (${this.orders.length})</h3>
    <table>
      <thead><tr>
        <th>Date</th><th>Time</th><th>Type</th><th>Customer</th>
        <th>Address</th><th>Items</th><th>Status</th><th>Taken By</th>
      </tr></thead>
      <tbody>${orderRows || "<tr><td colspan='8' style='text-align:center;padding:12px;color:#888'>No orders this month</td></tr>"}</tbody>
    </table>

    <h3>Trash Runs (${this.trash.length})</h3>
    <table>
      <thead><tr><th>Date</th><th>Time</th><th>Note</th><th>Status</th></tr></thead>
      <tbody>${trashRows || "<tr><td colspan='4' style='text-align:center;padding:12px;color:#888'>No trash runs this month</td></tr>"}</tbody>
    </table>

    <div class="footer">DART Thrift Commercial Services · Ridgecrest, CA · ${monthName} ${this.year}</div>
    </body></html>`;
  }

  // ── Static yearly generators ──────────────────────────────────────────────
  // Fetches all 12 months at once, generates either:
  //   - Excel: 1 Summary sheet + 12 monthly sheets
  //   - HTML:  all 12 months as continuous pages with page-break-after

  static async generateYearlyExcel(
    supabase: SupabaseClient,
    year: number,
  ): Promise<ArrayBuffer> {
    const wb = XLSX.utils.book_new();
    const hdrStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "166534" } },
      alignment: { horizontal: "center" as const, wrapText: true },
    };

    // Fetch all 12 months in parallel
    const monthTemplates = await Promise.all(
      MONTHS.map(async (_, i) => {
        const m    = i + 1;
        const tmpl = new DeliveryExportTemplate(supabase, m, year);
        await tmpl.fetchData();
        return tmpl;
      })
    );

    // ── Summary sheet ──────────────────────────────────────────────────────
    const summaryHeaders = [
      "Month", "Total Orders", "Deliveries", "Pickups",
      "Completed", "Completion %", "Trash Runs", "Trash Done",
    ];
    const summaryRows = monthTemplates.map((t, i) => {
      const deliveries = t.orders.filter((o) => o.order_type === "delivery").length;
      const pickups    = t.orders.filter((o) => o.order_type === "pickup").length;
      const completed  = t.orders.filter((o) => o.status === "completed").length;
      const trashDone  = t.trash.filter((r)  => r.status === "done").length;
      const pct        = t.orders.length > 0
        ? `${Math.round((completed / t.orders.length) * 100)}%` : "—";
      return [
        MONTHS[i], t.orders.length, deliveries, pickups,
        completed, pct, t.trash.length, trashDone,
      ];
    });

    // Totals row
    const totals = [
      "TOTAL",
      summaryRows.reduce((s, r) => s + (r[1] as number), 0),
      summaryRows.reduce((s, r) => s + (r[2] as number), 0),
      summaryRows.reduce((s, r) => s + (r[3] as number), 0),
      summaryRows.reduce((s, r) => s + (r[4] as number), 0),
      "—",
      summaryRows.reduce((s, r) => s + (r[6] as number), 0),
      summaryRows.reduce((s, r) => s + (r[7] as number), 0),
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet([
      [`DART Thrift — ${year} Annual Report`, "", "", "", "", "", "", ""],
      [`Generated: ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}`, "", "", "", "", "", "", ""],
      [],
      summaryHeaders,
      ...summaryRows,
      [],
      totals,
    ]);

    summaryWs["!cols"] = [
      { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 10 },
      { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 12 },
    ];
    summaryWs["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    ];

    // Style title + headers
    if (summaryWs["A1"]) summaryWs["A1"].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: "center" as const } };
    if (summaryWs["A2"]) summaryWs["A2"].s = { font: { sz: 9, color: { rgb: "888888" } }, alignment: { horizontal: "center" as const } };
    summaryHeaders.forEach((_, c) => {
      const addr = XLSX.utils.encode_cell({ r: 3, c });
      if (summaryWs[addr]) summaryWs[addr].s = hdrStyle;
    });
    // Totals row style
    const totalsRow = 3 + summaryRows.length + 2;
    summaryHeaders.forEach((_, c) => {
      const addr = XLSX.utils.encode_cell({ r: totalsRow, c });
      if (summaryWs[addr]) summaryWs[addr].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "166534" } },
      };
    });

    summaryWs["!freeze"] = { xSplit: 0, ySplit: 4 };
    XLSX.utils.book_append_sheet(wb, summaryWs, "📊 Annual Summary");

    // ── One sheet per month ────────────────────────────────────────────────
    const orderHeaders = [
      "Date","Time","Type","Customer","Address","Items","Notes","Status","Taken By",
    ];
    const trashHeaders = ["Date","Time","Note","Status"];

    monthTemplates.forEach((t, i) => {
      const monthName = MONTHS[i];
      if (t.orders.length === 0 && t.trash.length === 0) return; // skip empty months

      const orderRows = t.orders.map((o, ri) => {
        const effectiveTime = o.scheduled_time_override ?? o.scheduled_time;
        const addr = o.order_type === "delivery" ? o.destination_address : o.origin_address;
        return [
          fmtDate(o.scheduled_date),
          fmtTime(effectiveTime),
          o.order_type === "delivery" ? "📦 Delivery" : "🚛 Pickup",
          o.customer_name,
          addr ?? "",
          o.item_description,
          o.item_notes ?? "",
          o.status.charAt(0).toUpperCase() + o.status.slice(1).replace("_", " "),
          o.taken_by ?? "",
        ];
      });

      const trashRows = t.trash.map((tr) => {
        const d  = new Date(tr.created_at);
        const pt = new Date(d.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
        return [
          pt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          pt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          tr.note ?? "Trash run to dump",
          tr.status === "done" ? "✓ Done" : "Pending",
        ];
      });

      // Build sheet: title → orders → gap → trash
      const sheetData: any[][] = [
        [`${monthName} ${year}`, "", "", "", "", "", "", "", ""],
        [`${t.orders.length} orders · ${t.trash.length} trash runs`, "", "", "", "", "", "", "", ""],
        [],
        [...orderHeaders],
        ...orderRows,
        [],
        ["TRASH RUNS", "", "", ""],
        [...trashHeaders],
        ...trashRows,
      ];

      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      ws["!cols"] = [
        { wch: 13 },{ wch: 9 },{ wch: 11 },{ wch: 18 },
        { wch: 28 },{ wch: 26 },{ wch: 22 },{ wch: 12 },{ wch: 13 },
      ];
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
      ];

      if (ws["A1"]) ws["A1"].s = { font: { bold: true, sz: 13 } };
      if (ws["A2"]) ws["A2"].s = { font: { sz: 9, color: { rgb: "888888" } } };

      // Style order headers (row 4 = index 3)
      orderHeaders.forEach((_, c) => {
        const addr = XLSX.utils.encode_cell({ r: 3, c });
        if (ws[addr]) ws[addr].s = hdrStyle;
      });

      // Style trash section header + headers
      const trashTitleRow = 4 + orderRows.length + 1;
      if (ws[XLSX.utils.encode_cell({ r: trashTitleRow, c: 0 })]) {
        ws[XLSX.utils.encode_cell({ r: trashTitleRow, c: 0 })].s = { font: { bold: true, sz: 11 } };
      }
      trashHeaders.forEach((_, c) => {
        const addr = XLSX.utils.encode_cell({ r: trashTitleRow + 1, c });
        if (ws[addr]) ws[addr].s = hdrStyle;
      });

      ws["!freeze"] = { xSplit: 0, ySplit: 4 };
      XLSX.utils.book_append_sheet(wb, ws, monthName.slice(0, 3)); // "Jan","Feb"…
    });

    return XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true });
  }

  static async generateYearlyHTML(
    supabase: SupabaseClient,
    year: number,
  ): Promise<string> {
    const monthTemplates = await Promise.all(
      MONTHS.map(async (_, i) => {
        const tmpl = new DeliveryExportTemplate(supabase, i + 1, year);
        await tmpl.fetchData();
        return tmpl;
      })
    );

    const monthSections = monthTemplates.map((t, i) => {
      const monthName  = MONTHS[i];
      const deliveries = t.orders.filter((o) => o.order_type === "delivery");
      const pickups    = t.orders.filter((o) => o.order_type === "pickup");
      const completed  = t.orders.filter((o) => o.status === "completed");
      const trashDone  = t.trash.filter((r)  => r.status === "done");

      const orderRows = t.orders.map((o, ri) => {
        const effectiveTime = o.scheduled_time_override ?? o.scheduled_time;
        const addr = o.order_type === "delivery" ? o.destination_address : o.origin_address;
        const bg   = ri % 2 === 0 ? "#fff" : "#f0fdf4";
        return `<tr style="background:${bg}">
          <td>${fmtDate(o.scheduled_date)}</td>
          <td>${fmtTime(effectiveTime)}</td>
          <td>${o.order_type === "delivery" ? "📦 Del" : "🚛 Pick"}</td>
          <td><strong>${o.customer_name}</strong></td>
          <td>${addr ?? ""}</td>
          <td>${o.item_description}</td>
          <td style="color:${o.status === "completed" ? "#166534" : "#b45309"};font-weight:bold">
            ${o.status.charAt(0).toUpperCase() + o.status.slice(1).replace("_", " ")}
          </td>
          <td>${o.taken_by ?? ""}</td>
        </tr>`;
      }).join("");

      const trashRows = t.trash.map((tr, ri) => {
        const d  = new Date(tr.created_at);
        const pt = new Date(d.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
        const bg = ri % 2 === 0 ? "#fff" : "#f0fdf4";
        return `<tr style="background:${bg}">
          <td>${pt.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" })}</td>
          <td>${pt.toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit" })}</td>
          <td>${tr.note ?? "Trash run"}</td>
          <td style="color:${tr.status === "done" ? "#166534" : "#b45309"};font-weight:bold">
            ${tr.status === "done" ? "✓ Done" : "Pending"}
          </td>
        </tr>`;
      }).join("");

      return `
      <div class="month-page">
        <h2>${monthName} ${year}</h2>
        <div class="stats">
          <div class="stat"><div class="n">${t.orders.length}</div><div class="l">Orders</div></div>
          <div class="stat"><div class="n">${deliveries.length}</div><div class="l">Deliveries</div></div>
          <div class="stat"><div class="n">${pickups.length}</div><div class="l">Pickups</div></div>
          <div class="stat"><div class="n">${completed.length}</div><div class="l">Completed</div></div>
          <div class="stat"><div class="n">${t.trash.length}</div><div class="l">Trash Runs</div></div>
          <div class="stat"><div class="n">${trashDone.length}</div><div class="l">Done</div></div>
        </div>
        <h3>Orders</h3>
        <table>
          <thead><tr><th>Date</th><th>Time</th><th>Type</th><th>Customer</th><th>Address</th><th>Items</th><th>Status</th><th>Taken By</th></tr></thead>
          <tbody>${orderRows || "<tr><td colspan='8' class='empty'>No orders</td></tr>"}</tbody>
        </table>
        <h3>Trash Runs</h3>
        <table>
          <thead><tr><th>Date</th><th>Time</th><th>Note</th><th>Status</th></tr></thead>
          <tbody>${trashRows || "<tr><td colspan='4' class='empty'>No trash runs</td></tr>"}</tbody>
        </table>
      </div>`;
    }).join("\n");

    // Annual summary totals
    const totalOrders    = monthTemplates.reduce((s, t) => s + t.orders.length, 0);
    const totalCompleted = monthTemplates.reduce((s, t) => s + t.orders.filter(o => o.status === "completed").length, 0);
    const totalTrash     = monthTemplates.reduce((s, t) => s + t.trash.length, 0);
    const totalDeliveries= monthTemplates.reduce((s, t) => s + t.orders.filter(o => o.order_type === "delivery").length, 0);
    const totalPickups   = monthTemplates.reduce((s, t) => s + t.orders.filter(o => o.order_type === "pickup").length, 0);

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>DART Thrift — ${year} Annual Report</title>
    <style>
      @page { size: letter; margin: 0.5in; }
      body { font-family: Arial, sans-serif; font-size: 9px; color: #1e293b; }
      .cover { text-align:center; padding: 60px 0; page-break-after: always; }
      .cover h1 { font-size: 28px; color: #166534; margin:0; }
      .cover h2 { font-size: 18px; color: #444; margin: 8px 0 0; font-weight:normal; }
      .cover .totals { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin:40px auto; max-width:500px; }
      .cover .total { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:16px; }
      .cover .total .n { font-size:28px; font-weight:bold; color:#166534; }
      .cover .total .l { font-size:10px; color:#555; margin-top:4px; }
      .month-page { page-break-after: always; }
      .month-page:last-child { page-break-after: avoid; }
      h2 { font-size:16px; color:#166534; border-bottom:2px solid #166534; padding-bottom:4px; margin:0 0 10px; }
      h3 { font-size:10px; font-weight:bold; text-transform:uppercase; letter-spacing:.05em;
           background:#166534; color:#fff; padding:4px 8px; margin:12px 0 0; border-radius:3px 3px 0 0; }
      .stats { display:grid; grid-template-columns:repeat(6,1fr); gap:6px; margin-bottom:10px; }
      .stat { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:4px; padding:6px; text-align:center; }
      .stat .n { font-size:16px; font-weight:bold; color:#166534; }
      .stat .l { font-size:8px; color:#555; }
      table { width:100%; border-collapse:collapse; font-size:8px; }
      th { background:#166534; color:#fff; padding:4px 5px; text-align:left; font-weight:bold; }
      td { padding:3px 5px; border-bottom:1px solid #e2e8f0; }
      .empty { text-align:center; color:#888; padding:8px; }
      .meta { font-size:8px; color:#888; margin-top:4px; }
    </style></head><body>

    <div class="cover">
      <h1>DART Thrift</h1>
      <h2>${year} Annual Delivery &amp; Pickup Report</h2>
      <p class="meta">Generated: ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}</p>
      <div class="totals">
        <div class="total"><div class="n">${totalOrders}</div><div class="l">Total Orders</div></div>
        <div class="total"><div class="n">${totalDeliveries}</div><div class="l">Deliveries</div></div>
        <div class="total"><div class="n">${totalPickups}</div><div class="l">Pickups</div></div>
        <div class="total"><div class="n">${totalCompleted}</div><div class="l">Completed</div></div>
        <div class="total"><div class="n">${totalTrash}</div><div class="l">Trash Runs</div></div>
        <div class="total"><div class="n">${totalOrders > 0 ? Math.round((totalCompleted / totalOrders) * 100) : 0}%</div><div class="l">Completion</div></div>
      </div>
    </div>

    ${monthSections}

    </body></html>`;
  }
}