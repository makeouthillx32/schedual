// app/api/analytics/event/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface EventPayload {
  sessionId: string;
  eventName: string;
  eventCategory?: string;
  eventAction?: string;
  eventLabel?: string;
  eventValue?: number;
  pageUrl?: string;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const payload: EventPayload = await request.json();
    
    // Find the user by session_id
    const { data: user } = await supabase
      .from('analytics_users')
      .select('id')
      .eq('session_id', payload.sessionId)
      .single();
    
    if (!user) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // Create event record
    const { error: eventError } = await supabase
      .from('analytics_events')
      .insert({
        user_id: user.id,
        session_id: payload.sessionId,
        event_name: payload.eventName,
        event_category: payload.eventCategory,
        event_action: payload.eventAction,
        event_label: payload.eventLabel,
        event_value: payload.eventValue,
        page_url: payload.pageUrl,
        metadata: payload.metadata,
      });
    
    if (eventError) {
      console.error('Error creating event:', eventError);
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Event tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}