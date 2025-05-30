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
    
    // Ensure creator is included in participants and remove duplicates
    const allParticipantIds = [...new Set([user.id, ...participantIds])];
    
    console.log("Creating group with:", {
      creator: user.id,
      name,
      participants: allParticipantIds
    });
    
    // DUPLICATE CHECK: Check if creator already has a group with same name and same participants
    const { data: existingGroups, error: checkError } = await supabase
      .from('channels')
      .select(`
        id,
        name,
        creator_id,
        type_id,
        channel_participants!inner(user_id)
      `)
      .eq('creator_id', user.id)
      .eq('name', name)
      .eq('type_id', 2); // 2 = group type
    
    if (checkError) {
      console.error("Error checking for duplicate groups:", checkError);
      // Continue anyway - let the database function handle it
    } else if (existingGroups && existingGroups.length > 0) {
      // Check if any existing group has the same participants
      for (const group of existingGroups) {
        const groupParticipants = group.channel_participants.map(p => p.user_id).sort();
        const newParticipants = allParticipantIds.sort();
        
        // Compare participant arrays
        if (groupParticipants.length === newParticipants.length && 
            groupParticipants.every((id, index) => id === newParticipants[index])) {
          
          console.log("Found duplicate group:", group.id);
          return NextResponse.json({ 
            error: `You already have a group called "${name}" with these participants. Please choose a different name or add different participants.`,
            isExisting: true,
            channelId: group.id
          }, { status: 409 }); // 409 = Conflict
        }
      }
    }
    
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
    
    // Check if this is a newly created group and set default avatar
    const { data: channelData, error: channelError } = await supabase
      .from('channels')
      .select('type_id, avatar_url, created_at')
      .eq('id', data)
      .single();
    
    if (channelError) {
      console.error("Failed to fetch channel data:", channelError);
    } else {
      // Only set default avatar for group chats and only if no avatar is already set
      if (channelData.type_id > 1 && !channelData.avatar_url) {
        const defaultGroupAvatarUrl = 'https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/avatars/groupchat.png';
        
        const { error: updateError } = await supabase
          .from('channels')
          .update({ avatar_url: defaultGroupAvatarUrl })
          .eq('id', data);
        
        if (updateError) {
          console.error("Failed to set default group avatar:", updateError);
          // Don't fail the request, just log the error
        } else {
          console.log("Default group avatar set successfully");
        }
      }
      
      // Check if this was an existing channel (created more than 5 seconds ago)
      const isExisting = channelData && 
                         new Date(channelData.created_at).getTime() < 
                         (Date.now() - 5000);
      
      if (isExisting) {
        console.log("Returning existing group channel");
        return NextResponse.json({ 
          channelId: data,
          isExisting: true,
          message: "You already have a group with this name. Opening existing group."
        });
      }
    }
    
    // Return the channel ID for new groups
    return NextResponse.json({ 
      channelId: data,
      isExisting: false 
    });
    
  } catch (error: any) {
    console.error("Unexpected error in start-group route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}