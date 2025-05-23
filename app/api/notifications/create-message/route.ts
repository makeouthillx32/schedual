// app/api/notifications/create-message/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface CreateMessageNotificationRequest {
  channel_id: string;
  sender_id: string;
  content: string;
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const {
      channel_id,
      sender_id,
      content,
    }: CreateMessageNotificationRequest = await req.json();

    if (!channel_id || !sender_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: channel_id, sender_id, content' }, 
        { status: 400 }
      );
    }

    // 1️⃣ Get channel participants (exclude the sender)
    const { data: participants, error: participantsError } = await supabase
      .from('channel_participants')
      .select('user_id')
      .eq('channel_id', channel_id)
      .neq('user_id', sender_id);

    if (participantsError) {
      console.error('Failed to fetch channel participants:', participantsError.message);
      return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
    }

    if (!participants || participants.length === 0) {
      return NextResponse.json({ message: 'No participants found to notify' }, { status: 200 });
    }

    // 2️⃣ Get sender display name from auth.users
    const { data: senderUser, error: senderError } = await supabase.auth.admin.getUserById(sender_id);
    
    if (senderError || !senderUser.user) {
      console.error('Failed to fetch sender info:', senderError?.message);
      return NextResponse.json({ error: 'Failed to fetch sender info' }, { status: 500 });
    }

    const metadata = (senderUser.user.user_metadata as Record<string, any>) || {};
    const senderName =
      metadata.display_name ||
      metadata.full_name ||
      senderUser.user.email?.split('@')[0] ||
      'Someone';

    console.log(`Creating individual message notifications for ${participants.length} participants from ${senderName}`);

    // 3️⃣ Create individual notification for each participant (no stacking in DB)
    const notifications = participants.map(participant => ({
      sender_id: sender_id,
      receiver_id: participant.user_id,
      type: 'message',
      title: `${senderName} sent you a message`,
      content: content,
      metadata: {
        channel_id: channel_id,
        sender_name: senderName
      },
      image_url: 'https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/avatars/notification.png',
      action_url: '/dashboard/me/messages',
      is_read: false,
      role_admin: false,
      role_jobcoach: false,
      role_client: false,
      role_user: false,
    }));

    const { data: insertedNotifications, error: insertError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (insertError) {
      console.error('Failed to create notifications:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log(`Created ${insertedNotifications?.length || 0} individual notifications`);
    
    return NextResponse.json({ 
      success: true, 
      created: insertedNotifications?.length || 0,
      notifications: insertedNotifications
    });

  } catch (error) {
    console.error('Error in create-message notification API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}