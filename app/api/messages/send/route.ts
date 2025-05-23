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

  // 3️⃣ Call the notification API to handle stacked notifications
  try {
    // Get the base URL for the API call
    const protocol = req.headers.get('x-forwarded-proto') || (req.url?.startsWith('https') ? 'https' : 'http');
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    console.log(`Calling notification API: ${baseUrl}/api/notifications/create-message`);
    
    const notificationResponse = await fetch(`${baseUrl}/api/notifications/create-message`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Forward any necessary auth headers
        'Cookie': req.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        channel_id: channel_id,
        sender_id: user.id,
        content: content
      })
    });
    
    if (!notificationResponse.ok) {
      const errorText = await notificationResponse.text();
      console.error('Failed to create notifications:', errorText);
    } else {
      const result = await notificationResponse.json();
      console.log('Notifications processed:', result);
    }
  } catch (error) {
    console.error('Error calling notification API:', error);
    // Don't fail the message send if notifications fail
  }

  return NextResponse.json({ success: true });
}