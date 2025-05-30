// app/api/messages/start-dm/route.ts

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const cookieStore = await cookies();

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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  const { userIds } = await req.json();

  if (!Array.isArray(userIds) || userIds.length !== 1) {
    return NextResponse.json({ error: 'Invalid userIds' }, { status: 400 });
  }

  const targetUserId = userIds[0];

  // Prevent self-messaging
  if (targetUserId === user.id) {
    return NextResponse.json({ 
      error: 'Cannot create conversation with yourself' 
    }, { status: 400 });
  }

  try {
    console.log(`[start-dm] Checking for existing DM between ${user.id} and ${targetUserId}`);

    // First, explicitly check if a DM already exists
    const { data: existingChannel, error: checkError } = await supabase
      .from('channels')
      .select(`
        id,
        created_at,
        channel_participants!inner (user_id)
      `)
      .eq('type_id', 1) // 1 = DM type
      .eq('channel_participants.user_id', user.id);

    if (checkError) {
      console.error('Error checking existing channels:', checkError);
    } else if (existingChannel && existingChannel.length > 0) {
      // Check if any of these channels also include the target user
      for (const channel of existingChannel) {
        const { data: participants, error: participantError } = await supabase
          .from('channel_participants')
          .select('user_id')
          .eq('channel_id', channel.id);

        if (!participantError && participants) {
          const userIds = participants.map(p => p.user_id);
          // If this channel has exactly 2 participants and includes both users
          if (userIds.length === 2 && userIds.includes(user.id) && userIds.includes(targetUserId)) {
            console.log(`[start-dm] Found existing DM: ${channel.id}`);
            return NextResponse.json({
              channelId: channel.id,
              isExisting: true,
              message: 'Conversation already exists'
            });
          }
        }
      }
    }

    // If no existing DM found, use the RPC function to create one
    console.log(`[start-dm] No existing DM found, creating new one`);
    
    const { data, error } = await supabase.rpc('find_or_create_dm', {
      p_user1_id: user.id,
      p_user2_id: targetUserId,
    });

    if (error) {
      console.error('RPC error:', error);
      return NextResponse.json({ error: 'Failed to create or find DM' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No data returned from DM creation' }, { status: 500 });
    }

    // Get channel creation time to determine if it was just created
    const { data: channelData, error: channelError } = await supabase
      .from('channels')
      .select('created_at')
      .eq('id', data[0].channel_id)
      .single();
    
    if (channelError) {
      console.error('Error fetching channel data:', channelError);
      // Still return success since the channel was created
      return NextResponse.json({
        channelId: data[0].channel_id,
        isExisting: false
      });
    }
    
    // If the channel was created more than 10 seconds ago, we consider it pre-existing
    const isExisting = channelData && 
                       new Date(channelData.created_at).getTime() < 
                       (Date.now() - 10000); // Increased from 5 to 10 seconds

    console.log(`[start-dm] ${isExisting ? 'Found existing' : 'Created new'} DM: ${data[0].channel_id}`);

    // Return success with clear indication of whether it was existing or new
    return NextResponse.json({
      channelId: data[0].channel_id,
      isExisting: isExisting || false,
      message: isExisting ? 'Opened existing conversation' : 'Created new conversation'
    });

  } catch (err) {
    console.error('Unexpected error in start-dm:', err);
    return NextResponse.json({ 
      error: 'Failed to create or find conversation' 
    }, { status: 500 });
  }
}