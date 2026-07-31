import React, { useState } from "react";
import { ShieldCheck, Lock, UserCheck, Building, FileText, CheckCircle2 } from "lucide-react";

interface PrintAuthModalProps {
  batchId: string;
  totalAmount: number;
  totalBills: number;
  stationPrefix: string;
  onAuthorize: (authData: {
    issuerName: string;
    department: string;
    issuerRole: string;
    issueReason: string;
  }) => void;
  onCancel: () => void;
}

export const PrintAuthModal: React.FC<PrintAuthModalProps> = ({
  batchId,
  totalAmount,
  totalBills,
  stationPrefix,
  onAuthorize,
  onCancel,
}) => {
  const [issuerName, setIssuerName] = useState("Staff Coach");
  const [department, setDepartment] = useState("Commercial Services");
  const [issuerRole, setIssuerRole] = useState("Manager / Supervisor");
  const [authPin, setAuthPin] = useState("1234");
  const [issueReason, setIssueReason] = useState("Monthly Department Cash Drawer Allotment");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuerName.trim()) {
      setErrorMsg("Issuer Name is required to log this print batch.");
      return;
    }

    onAuthorize({
      issuerName: issuerName.trim() || "Authorized Staff",
      department,
      issuerRole,
      issueReason: issueReason.trim() || "Standard Batch Issue",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg p-6 rounded-2xl border border-border shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-primary">
            <Lock className="w-6 h-6 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Print Authorization Safeguard</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
          >
            Cancel
          </button>
        </div>

        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-1">
          <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-300">
            <span>Batch Hash: <span className="font-mono">{batchId}</span></span>
            <span>Station: {stationPrefix}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Total Value: <strong>${totalAmount.toFixed(2)}</strong></span>
            <span>Bills Count: <strong>{totalBills} Bills</strong></span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1">
              Authorized Issuer Name *
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={issuerName}
                onChange={(e) => {
                  setIssuerName(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="e.g. Manager Darlene, Coach Alex"
                className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-md font-semibold text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-foreground mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-xs font-semibold"
              >
                <option value="Commercial Services">Commercial Services</option>
                <option value="Thrift Shop">DART Thrift Shop</option>
                <option value="Vocational Training">Vocational Training</option>
                <option value="Janitorial Services">Janitorial Services</option>
                <option value="Administration">Administration</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Authorization PIN</label>
              <input
                type="password"
                maxLength={6}
                value={authPin}
                onChange={(e) => {
                  setAuthPin(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="1234"
                className="w-full px-3 py-2 bg-background border border-input rounded-md font-mono text-sm tracking-widest"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Issue Purpose / Reason</label>
            <input
              type="text"
              value={issueReason}
              onChange={(e) => setIssueReason(e.target.value)}
              placeholder="e.g. Weekly Client Performance Rewards"
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            />
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg"
            >
              <ShieldCheck className="w-4 h-4" />
              Authorize & Log Print Run
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
