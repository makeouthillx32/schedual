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

  // 3️⃣ Get channel participants (exclude the sender)
  const { data: participants, error: participantsError } = await supabase
    .from('channel_participants')
    .select('user_id')
    .eq('channel_id', channel_id)
    .neq('user_id', user.id); // Exclude the sender

  if (participantsError) {
    console.error('Failed to fetch channel participants:', participantsError.message);
    // Continue anyway - message was sent successfully
  }

  // 4️⃣ Derive display name from auth.user metadata
  const metadata = (user.user_metadata as Record<string, any>) || {};
  const displayName =
    metadata.display_name ||
    metadata.full_name ||
    user.email?.split('@')[0] ||
    'Someone';

  // 5️⃣ Create notifications for each recipient
  if (participants && participants.length > 0) {
    const notifications = participants.map(participant => ({
      receiver_id: participant.user_id, // ✅ Use actual user ID, not channel ID
      title: `${displayName} sent you a message`,
      subtitle: content.length > 50 ? content.slice(0, 50) + '...' : content,
      action_url: `/messages/${channel_id}`, // Adjust this URL to match your app routing
      image_url: null, // You could add sender's avatar here if needed
    }));

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notifError) {
      console.error('Failed to create notifications:', notifError.message);
      // Not fatal for the message send
    } else {
      console.log(`Created ${notifications.length} notification(s) for message in channel ${channel_id}`);
    }
  } else {
    console.log('No other participants found in channel, no notifications created');
  }

  return NextResponse.json({ success: true });
}