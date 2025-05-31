// app/api/messages/[channel_id]/route.ts

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensures dynamic route works in all environments

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ channel_id: string }> }
) {
  const supabase = await createClient();

  // In Next.js 15, params is a Promise that needs to be awaited
  const params = await context.params;
  const channel_id = params?.channel_id;

  if (!channel_id) {
    return NextResponse.json({ error: 'Missing channel_id' }, { status: 400 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase.rpc('get_channel_messages', {
    p_channel_id: channel_id,
    p_user_id: user.id,
    p_limit: 50,
    p_before_id: null,
  });

  if (error) {
    console.error('[API] Supabase RPC error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch messages.' }, { status: 500 });
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