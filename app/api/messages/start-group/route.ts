// app/api/messages/start-group/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { creatorId, name, participantIds } = await request.json();
    
    if (!name || !participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: "Group name and participant IDs array are required" },
        { status: 400 }
      );
    }

    // Use cookies() as a function for authentication
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the authenticated user instead of trusting creatorId from the request
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("Auth check result:", user ? "User authenticated" : "Not authenticated", userError);

    if (userError || !user) {
      console.error("Authentication error:", userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Use the authenticated user's ID instead of the provided creatorId
    const authenticatedCreatorId = user.id;
    
    // Ensure creator is included in participants
    const allParticipantIds = [...new Set([authenticatedCreatorId, ...participantIds])];
    
    console.log("Creating group with:", {
      creator: authenticatedCreatorId,
      name,
      participants: allParticipantIds
    });
    
    // Call the Postgres function to create or get a group channel
    const { data, error } = await supabase.rpc("create_or_get_group_channel", {
      p_creator_id: authenticatedCreatorId,
      p_channel_name: name,
      p_participant_ids: allParticipantIds
    });

    if (error) {
      console.error("Failed to create group channel:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Group channel created/found:", data);
    return NextResponse.json({ channelId: data });
  } catch (error) {
    console.error("Unexpected error in start-group route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}