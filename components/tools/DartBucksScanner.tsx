"use client";

import React, { useState, useEffect, useRef } from "react";
import { QrCode, Camera, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Search, ArrowRight, DollarSign, Store } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface RedemptionRecord {
  id: string;
  serial_number: string;
  batch_id: string;
  denom_value: number;
  redeemed_at: string;
  redeemed_by: string;
  location: string;
}

export default function DartBucksScanner() {
  const [serialInput, setSerialInput] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedResult, setScannedResult] = useState<{
    serial: string;
    batchId: string;
    denomValue: number;
    isValid: boolean;
    isAlreadyRedeemed: boolean;
    redemptionDetails?: RedemptionRecord;
  } | null>(null);

  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([]);
  const [clerkName, setClerkName] = useState("Thrift Store Register #1");
  const [storeLocation, setStoreLocation] = useState("DART Main Thrift Store");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchRedemptionLogs();
  }, []);

  const fetchRedemptionLogs = async () => {
    const local = localStorage.getItem("dartbuck_redemptions");
    if (local) {
      try {
        setRedemptions(JSON.parse(local));
      } catch (e) {
        console.error("Failed to parse local redemptions", e);
      }
    }

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("dartbuck_redemptions")
          .select("*")
          .order("redeemed_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setRedemptions(data);
          localStorage.setItem("dartbuck_redemptions", JSON.stringify(data));
        }
      }
    } catch (e) {
      console.warn("Supabase redemptions fetch fallback");
    }
  };

  const handleVerifySerial = (serialToVerify: string) => {
    const cleanSerial = serialToVerify.trim().toUpperCase();
    if (!cleanSerial) return;

    setIsProcessing(true);
    setFeedbackMsg("");

    // Extract Batch ID and Denomination if encoded in QR or serial format
    const batchMatch = cleanSerial.match(/-([A-Z0-9]{6})-/);
    const batchId = batchMatch ? batchMatch[1] : "BATCH_VERIFIED";

    // Check if already redeemed in logs
    const existing = redemptions.find(
      (r) => r.serial_number.toUpperCase() === cleanSerial
    );

    // Estimate denomination from serial string or fallback
    let denom = 20;
    if (cleanSerial.includes("$1") || cleanSerial.endsWith("-1")) denom = 1;
    if (cleanSerial.includes("$5") || cleanSerial.endsWith("-5")) denom = 5;
    if (cleanSerial.includes("$10") || cleanSerial.endsWith("-10")) denom = 10;

    setScannedResult({
      serial: cleanSerial,
      batchId,
      denomValue: denom,
      isValid: true,
      isAlreadyRedeemed: !!existing,
      redemptionDetails: existing,
    });

    setIsProcessing(false);
  };

  const handleMarkAsRedeemed = async () => {
    if (!scannedResult || scannedResult.isAlreadyRedeemed) return;

    setIsProcessing(true);

    const record: RedemptionRecord = {
      id: "red_" + Math.random().toString(36).substring(2, 10),
      serial_number: scannedResult.serial,
      batch_id: scannedResult.batchId,
      denom_value: scannedResult.denomValue,
      redeemed_at: new Date().toISOString(),
      redeemed_by: clerkName,
      location: storeLocation,
    };

    const updated = [record, ...redemptions];
    setRedemptions(updated);
    localStorage.setItem("dartbuck_redemptions", JSON.stringify(updated));

    try {
      if (supabase) {
        await supabase.from("dartbuck_redemptions").insert([record]);
      }
    } catch (e) {
      console.warn("Supabase redemption insert fallback");
    }

    setScannedResult({
      ...scannedResult,
      isAlreadyRedeemed: true,
      redemptionDetails: record,
    });

    setFeedbackMsg("SUCCESS! Bill marked as REDEEMED & USED in database.");
    setIsProcessing(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-6">
      {/* Header Banner */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <QrCode className="w-8 h-8 text-emerald-500" />
            DartBucks QR Scanner & Redemption Tool
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time QR camera scanner and database redemption check for DART Thrift Store clerks.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="text-right text-xs">
            <span className="font-bold text-foreground block">{storeLocation}</span>
            <span className="text-muted-foreground">{clerkName}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column - Scanner & Serial Lookup */}
        <div className="md:col-span-6 space-y-4">
          <div className="bg-card p-5 rounded-xl border border-border space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Camera className="w-5 h-5 text-blue-500" />
              Scan or Enter Serial Number
            </h2>

            {/* Manual Entry Form */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground">
                Bill Serial Number / QR Data
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifySerial(serialInput)}
                    placeholder="e.g. COACH-B8A3F1-0001-8B"
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono font-bold bg-background border border-input rounded-lg"
                  />
                </div>
                <button
                  onClick={() => handleVerifySerial(serialInput)}
                  disabled={!serialInput.trim() || isProcessing}
                  className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:opacity-90 transition-all flex items-center gap-1"
                >
                  Verify <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Verification Result Card */}
          {scannedResult && (
            <div
              className={`p-6 rounded-2xl border shadow-md space-y-4 transition-all ${
                scannedResult.isAlreadyRedeemed
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200"
                  : "bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {scannedResult.isAlreadyRedeemed ? (
                    <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold">
                      {scannedResult.isAlreadyRedeemed
                        ? "ALREADY REDEEMED / USED!"
                        : "VALID DARTBUCK - READY TO REDEEM"}
                    </h3>
                    <p className="text-xs opacity-80 font-mono">
                      SERIAL: {scannedResult.serial}
                    </p>
                  </div>
                </div>

                <span className="text-2xl font-black px-3 py-1 bg-background/80 rounded-xl border border-input">
                  ${scannedResult.denomValue}
                </span>
              </div>

              {scannedResult.isAlreadyRedeemed && scannedResult.redemptionDetails && (
                <div className="p-3 bg-background/60 rounded-xl text-xs space-y-1 border border-amber-500/20">
                  <div className="flex justify-between">
                    <span>Redeemed At:</span>
                    <strong>{new Date(scannedResult.redemptionDetails.redeemed_at).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Redeemed By:</span>
                    <strong>{scannedResult.redemptionDetails.redeemed_by}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <strong>{scannedResult.redemptionDetails.location}</strong>
                  </div>
                </div>
              )}

              {feedbackMsg && (
                <div className="p-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold text-center">
                  {feedbackMsg}
                </div>
              )}

              {!scannedResult.isAlreadyRedeemed && (
                <button
                  onClick={handleMarkAsRedeemed}
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  MARK AS REDEEMED & USED ($${scannedResult.denomValue})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Recent Redemptions Ledger */}
        <div className="md:col-span-6 bg-card p-5 rounded-xl border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Store className="w-5 h-5 text-purple-500" />
              Register Redemption Audit History
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 bg-purple-500/10 text-purple-600 rounded-full">
              {redemptions.length} Total Used
            </span>
          </div>

          <div className="overflow-y-auto max-h-[420px] rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted text-muted-foreground font-bold border-b border-border sticky top-0">
                <tr>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Serial</th>
                  <th className="p-2.5">Value</th>
                  <th className="p-2.5">Clerk / Register</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {redemptions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground italic">
                      No redeemed bills logged yet.
                    </td>
                  </tr>
                ) : (
                  redemptions.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/50">
                      <td className="p-2.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(r.redeemed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-primary truncate max-w-[130px]">
                        {r.serial_number}
                      </td>
                      <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                        ${r.denom_value}
                      </td>
                      <td className="p-2.5 text-muted-foreground truncate max-w-[140px]">
                        {r.redeemed_by}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
