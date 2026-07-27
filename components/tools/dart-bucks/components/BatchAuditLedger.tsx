import React, { useState } from "react";
import { FileSpreadsheet, Download, ShieldCheck, Search, CheckCircle2, Clock, DollarSign, Check } from "lucide-react";
import { BatchLogItem } from "../types";

interface BatchAuditLedgerProps {
  logs: BatchLogItem[];
  onToggleComplete: (logId: string) => void;
}

export const BatchAuditLedger: React.FC<BatchAuditLedgerProps> = ({ logs, onToggleComplete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.batch_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.issuer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.station_prefix.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? log.status !== "completed"
        : log.status === "completed";

    if (selectedMonth === "all") return matchesSearch && matchesStatus;
    const logMonth = new Date(log.printed_at).toISOString().substring(0, 7);
    return matchesSearch && matchesStatus && logMonth === selectedMonth;
  });

  const totalValueIssued = filteredLogs.reduce((sum, item) => sum + item.drawer_amount, 0);
  const totalBillsIssued = filteredLogs.reduce((sum, item) => sum + item.total_bills_count, 0);
  const completedBatchesCount = logs.filter((l) => l.status === "completed").length;

  const exportMonthlyCSV = () => {
    if (filteredLogs.length === 0) {
      alert("No logs available to export.");
      return;
    }

    const headers = [
      "Log ID",
      "Timestamp",
      "Cycle Status",
      "Completed Date",
      "Batch ID",
      "Station",
      "Issuer Name",
      "Issuer Role",
      "Department",
      "Mode",
      "Total Amount ($)",
      "Total Bills",
      "$20 Bills",
      "$10 Bills",
      "$5 Bills",
      "$1 Bills",
      "Serial Range",
      "Issue Reason",
    ];

    const rows = filteredLogs.map((log) => [
      `"${log.id}"`,
      `"${new Date(log.printed_at).toLocaleString()}"`,
      `"${log.status === "completed" ? "Completed & Collected" : "Active in Circulation"}"`,
      `"${log.completed_at ? new Date(log.completed_at).toLocaleString() : "N/A"}"`,
      `"${log.batch_id}"`,
      `"${log.station_prefix}"`,
      `"${log.issuer_name}"`,
      `"${log.issuer_role}"`,
      `"${log.department}"`,
      `"${log.mode}"`,
      log.drawer_amount.toFixed(2),
      log.total_bills_count,
      log.itemized_breakdown.bill20,
      log.itemized_breakdown.bill10,
      log.itemized_breakdown.bill5,
      log.itemized_breakdown.bill1,
      `"${log.serial_start} - ${log.serial_end}"`,
      `"${log.issue_reason}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);

    const monthStr = selectedMonth === "all" ? "All_Months" : selectedMonth;
    link.setAttribute("download", `DartBucks_Monthly_Audit_Log_${monthStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-8 bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            Monthly Batch Audit & Collection Cycle Ledger
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track active circulation and check batches as complete when all bills are collected!
          </p>
        </div>

        <button
          onClick={exportMonthlyCSV}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-md"
        >
          <Download className="w-4 h-4" />
          Export Monthly Audit Log (.CSV)
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Total Value Issued</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ${totalValueIssued.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-blue-600 shrink-0" />
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Total Printed Bills</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {totalBillsIssued} Bills
            </span>
          </div>
        </div>

        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-purple-600 shrink-0" />
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Cycles Completed & Collected</span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {completedBatchesCount} / {logs.length} Batches
            </span>
          </div>
        </div>
      </div>

      {/* Filter Controls & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        <div className="flex gap-1 bg-muted p-1 rounded-lg text-xs font-bold w-fit">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              statusFilter === "all"
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Batches ({logs.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              statusFilter === "active"
                ? "bg-background text-foreground shadow text-amber-600 dark:text-amber-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Active In Circulation ({logs.filter((l) => l.status !== "completed").length})
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              statusFilter === "completed"
                ? "bg-background text-foreground shadow text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Completed & Collected ({completedBatchesCount})
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Issuer, Batch ID..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-input rounded-lg"
            />
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs bg-background border border-input rounded-lg font-semibold"
          >
            <option value="all">All Months</option>
            <option value="2026-07">July 2026</option>
            <option value="2026-06">June 2026</option>
            <option value="2026-05">May 2026</option>
          </select>
        </div>
      </div>

      {/* Log Table with Check as Complete Action */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted text-muted-foreground font-bold border-b border-border">
            <tr>
              <th className="p-3">Cycle Status</th>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Batch ID</th>
              <th className="p-3">Authorized Issuer</th>
              <th className="p-3">Department</th>
              <th className="p-3">Drawer Value</th>
              <th className="p-3">Bills Breakdown</th>
              <th className="p-3 text-right">Cycle Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-muted-foreground italic">
                  No print batch logs found matching your filters.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isCompleted = log.status === "completed";
                return (
                  <tr key={log.id} className={`hover:bg-muted/50 transition-colors ${isCompleted ? "bg-emerald-500/5" : ""}`}>
                    <td className="p-3 whitespace-nowrap">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Cycle Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          In Circulation
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                      {new Date(log.printed_at).toLocaleDateString()} {new Date(log.printed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 font-mono font-bold text-primary">
                      {log.batch_id}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-foreground">{log.issuer_name}</span>
                      <span className="block text-[10px] text-muted-foreground">{log.issuer_role}</span>
                    </td>
                    <td className="p-3 font-medium text-foreground">
                      {log.department}
                    </td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                      ${log.drawer_amount.toFixed(2)}
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      20s:{log.itemized_breakdown.bill20} | 10s:{log.itemized_breakdown.bill10} | 5s:{log.itemized_breakdown.bill5} | 1s:{log.itemized_breakdown.bill1}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onToggleComplete(log.id)}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-auto ${
                          isCompleted
                            ? "bg-muted text-muted-foreground border border-input hover:bg-background"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {isCompleted ? "Reopen Batch" : "Check as Complete & Collected"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
