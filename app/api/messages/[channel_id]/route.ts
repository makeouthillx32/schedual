// app/api/messages/[channel_id]/route.ts

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Using export const GET pattern without explicit types
// This lets Next.js handle the type inference
export const GET = async (req, { params }) => {
  try {
    // Get channel_id from params
    const { channel_id } = params;
    
    // Init Supabase client
    const supabase = await createClient();

    // Ensure the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call the RPC function
    const { data, error } = await supabase.rpc('get_channel_messages', {
      p_channel_id: channel_id,
      p_user_id: user.id,
      p_limit: 50,
      p_before_id: null,
    });

    if (error) {
      console.error('RPC error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map rows to front-end shape
    const messages = (data ?? []).map((row) => ({
      id: row.message_id,
      content: row.content,
      timestamp: row.created_at,
      sender: {
        id: row.sender_id,
        name: row.sender_name,
        email: row.sender_email,
        avatar: row.sender_avatar_url,
      },
      isEdited: row.is_edited,
      reactions: row.reactions,
      attachments: row.attachments,
    }));

    // Return JSON array of messages
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}


// // app/api/server/[id]/fetchMessageData/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { supabase } from "@/lib/supabaseClient";

// // Route: GET /api/server/[id]/fetchMessageData
// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const { id } = params;

//   // 1) Fetch all messages for this channel
//   const { data: messages, error } = await supabase
//     .from("messages")
//     .select("id, sender_id, content, created_at")
//     .eq("channel_id", id)
//     .order("created_at", { ascending: true });

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   // 2) Compute your analytics
//   const allMsgs = messages ?? [];

//   // Process data for different time ranges
//   const hourData = processHourData(allMsgs);
//   const weekData = processWeekData(allMsgs);
//   const fourWeekData = processFourWeekData(allMsgs);

//   const generalData = {
//     totalMessages: allMsgs.length,
//     uniqueSenders: new Set(allMsgs.map((m) => m.sender_id)).size,
//   };

//   const finalData = [
//     {
//       HourData: hourData,
//       WeekData: weekData,
//       FourWeekData: fourWeekData,
//       GeneralData: generalData,
//     },
//   ];

//   return NextResponse.json({ finalData }, { status: 200 });
// }

// // Process messages for hourly data (last 24 hours)
// function processHourData(messages: any[]) {
//   const now = new Date();
//   const hourlyData = Array(24).fill(0).map((_, index) => {
//     const hourDate = new Date(now);
//     hourDate.setHours(now.getHours() - 23 + index);
    
//     const startHour = new Date(hourDate);
//     startHour.setMinutes(0, 0, 0);
    
//     const endHour = new Date(hourDate);
//     endHour.setMinutes(59, 59, 999);
    
//     const count = messages.filter(msg => {
//       const msgDate = new Date(msg.created_at);
//       return msgDate >= startHour && msgDate <= endHour;
//     }).length;
    
//     return {
//       hour: `${hourDate.getHours()}:00`,
//       count: count
//     };
//   });
  
//   return hourlyData;
// }

// // Process messages for weekly data (last 7 days)
// function processWeekData(messages: any[]) {
//   const now = new Date();
//   const dailyData = Array(7).fill(0).map((_, index) => {
//     const dayDate = new Date(now);
//     dayDate.setDate(now.getDate() - 6 + index);
    
//     const startDay = new Date(dayDate);
//     startDay.setHours(0, 0, 0, 0);
    
//     const endDay = new Date(dayDate);
//     endDay.setHours(23, 59, 59, 999);
    
//     const count = messages.filter(msg => {
//       const msgDate = new Date(msg.created_at);
//       return msgDate >= startDay && msgDate <= endDay;
//     }).length;
    
//     return {
//       day: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
//       count: count
//     };
//   });
  
//   return dailyData;
// }

// // Process messages for four-week data (last 4 weeks)
// function processFourWeekData(messages: any[]) {
//   const now = new Date();
//   const weeklyData = Array(4).fill(0).map((_, index) => {
//     const weekStartDate = new Date(now);
//     weekStartDate.setDate(now.getDate() - 21 + (index * 7) - weekStartDate.getDay());
    
//     const weekStart = new Date(weekStartDate);
//     weekStart.setHours(0, 0, 0, 0);
    
//     const weekEnd = new Date(weekStartDate);
//     weekEnd.setDate(weekStartDate.getDate() + 6);
//     weekEnd.setHours(23, 59, 59, 999);
    
//     const count = messages.filter(msg => {
//       const msgDate = new Date(msg.created_at);
//       return msgDate >= weekStart && msgDate <= weekEnd;
//     }).length;
    
//     return {
//       week: `Week ${index + 1}`,
//       count: count
//     };
//   });
  
//   return weeklyData;
// }