// app/api/messages/[channel_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  req: NextRequest,
  context: { params: { channel_id: string } }
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase.rpc('get_channel_messages', {
    p_channel_id: context.params.channel_id,
    p_user_id: user.id,
    p_limit: 50,
    p_before_id: null,
  });

  if (error) {
    console.error('RPC error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const messages = (data ?? []).map((row: any) => ({
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

  return NextResponse.json(messages);
}