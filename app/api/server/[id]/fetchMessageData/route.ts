// app/api/server/[id]/fetchMessageData/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Route: GET /api/server/[id]/fetchMessageData
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // 1) Fetch all messages for this channel
  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at")
    .eq("channel_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2) Compute your analytics
  const allMsgs = messages ?? [];

  // TODO: replace these empty arrays with your real bucketing logic
  const hourData: any[] = [];      // e.g. counts per hour over the last 24h
  const weekData: any[] = [];      // e.g. counts per day over the last 7d
  const fourWeekData: any[] = [];  // e.g. counts per week over the last 4w

  const generalData = {
    totalMessages: allMsgs.length,
    uniqueSenders: new Set(allMsgs.map((m) => m.sender_id)).size,
  };

  const finalData = [
    {
      HourData: hourData,
      WeekData: weekData,
      FourWeekData: fourWeekData,
      GeneralData: generalData,
    },
  ];

  return NextResponse.json({ finalData }, { status: 200 });
}