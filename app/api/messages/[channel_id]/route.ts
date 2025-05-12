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