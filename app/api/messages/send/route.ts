// app/api/messages/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    channel_id,
    content,
  }: {
    channel_id: string;
    content: string;
  } = await req.json();

  // 1️⃣ Authenticate
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2️⃣ Insert the message
  const { error: insertError } = await supabase
    .from('messages')
    .insert({ channel_id, sender_id: user.id, content });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // 3️⃣ Derive display name from auth.user metadata
  const metadata = (user.user_metadata as Record<string, any>) || {};
  const displayName =
    metadata.display_name ||
    metadata.full_name ||
    user.email ||
    'Someone';

  // 4️⃣ Insert the notification with the real sender name
  const { error: notifError } = await supabase
    .from('notifications')
    .insert({
      receiver_id: channel_id,
      title:       `${displayName} sent you a new message`,
      subtitle:    content.slice(0, 50),
      action_url:  `/dashboard/${channel_id}/messages`,
    });

  if (notifError) {
    console.error('Failed to create notification:', notifError.message);
    // not fatal for the message send
  }

  return NextResponse.json({ success: true });
}