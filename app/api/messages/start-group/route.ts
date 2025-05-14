// app/api/messages/start-group/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  try {
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Parse request body
    const { name, participantIds } = await request.json();
    
    if (!name || !participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: "Group name and participant IDs array are required" },
        { status: 400 }
      );
    }
    
    // Ensure creator is included in participants (though our function handles this too)
    const allParticipantIds = [...new Set([...participantIds])];
    
    console.log("Creating group with:", {
      creator: user.id,
      name,
      participants: allParticipantIds
    });
    
    // Call the Postgres function to create or get a group channel
    const { data, error } = await supabase.rpc("create_or_get_group_channel", {
      p_creator_id: user.id,
      p_channel_name: name,
      p_participant_ids: allParticipantIds
    });

    if (error) {
      console.error("Failed to create group channel:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Group channel created/found with ID:", data);
    
    // Return just the channel ID as a simple string to match the format
    // expected by the frontend component
    return NextResponse.json({ channelId: data });
    
  } catch (error: any) {
    console.error("Unexpected error in start-group route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}