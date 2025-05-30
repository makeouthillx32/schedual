// app/api/analytics/events/route.ts
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
    
    // Validate required fields
    if (!payload.sessionId || !payload.eventName) {
      return NextResponse.json({ 
        error: 'Missing required fields: sessionId, eventName' 
      }, { status: 400 });
    }
    
    // Find the user by session_id
    const { data: user, error: userError } = await supabase
      .from('analytics_users')
      .select('id')
      .eq('session_id', payload.sessionId)
      .maybeSingle();
    
    if (userError) {
      console.error('Error finding user for events:', userError);
      return NextResponse.json({ 
        error: 'Database error while finding user',
        details: userError.message 
      }, { status: 500 });
    }
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Session not found. Please track a page view first to create the session.' 
      }, { status: 404 });
    }
    
    // Validate event value if provided
    if (payload.eventValue !== undefined && (isNaN(payload.eventValue) || payload.eventValue < 0)) {
      return NextResponse.json({ 
        error: 'Event value must be a positive number' 
      }, { status: 400 });
    }
    
    // Sanitize metadata - ensure it's valid JSON
    let sanitizedMetadata = null;
    if (payload.metadata) {
      try {
        // Ensure metadata can be serialized to JSON and limit size
        const metadataString = JSON.stringify(payload.metadata);
        if (metadataString.length > 10000) { // 10KB limit
          return NextResponse.json({ 
            error: 'Metadata too large. Maximum 10KB allowed.' 
          }, { status: 400 });
        }
        sanitizedMetadata = JSON.parse(metadataString);
      } catch (error) {
        console.error('Invalid metadata format:', error);
        return NextResponse.json({ 
          error: 'Invalid metadata format. Must be valid JSON.' 
        }, { status: 400 });
      }
    }
    
    // Create event record
    const { data: eventData, error: eventError } = await supabase
      .from('analytics_events')
      .insert({
        user_id: user.id,
        session_id: payload.sessionId,
        event_name: payload.eventName,
        event_category: payload.eventCategory || null,
        event_action: payload.eventAction || null,
        event_label: payload.eventLabel || null,
        event_value: payload.eventValue || null,
        page_url: payload.pageUrl || null,
        metadata: sanitizedMetadata,
      })
      .select('id, created_at')
      .single();
    
    if (eventError) {
      console.error('Error creating event:', eventError);
      return NextResponse.json({ 
        error: 'Failed to track event',
        details: eventError.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      eventId: eventData.id,
      timestamp: eventData.created_at,
      event: {
        name: payload.eventName,
        category: payload.eventCategory,
        action: payload.eventAction,
        label: payload.eventLabel,
        value: payload.eventValue
      }
    });
    
  } catch (error) {
    console.error('Event tracking error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for testing and retrieving events
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const sessionId = searchParams.get('sessionId');
    const eventName = searchParams.get('eventName');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (sessionId || eventName) {
      // Return filtered events
      let query = supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }
      
      if (eventName) {
        query = query.eq('event_name', eventName);
      }
      
      const { data: events, error } = await query;
      
      if (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
      }
      
      return NextResponse.json(events);
    }
    
    // Return API documentation
    return NextResponse.json({
      message: 'Analytics events tracking endpoint is active',
      endpoints: {
        POST: 'Track custom events',
        GET: 'Retrieve events (add ?sessionId=xxx or ?eventName=xxx to filter)',
      },
      example: {
        sessionId: 'session-123',
        eventName: 'button_click',
        eventCategory: 'engagement',
        eventAction: 'click',
        eventLabel: 'header_cta',
        eventValue: 1,
        pageUrl: '/dashboard',
        metadata: {
          buttonText: 'Get Started',
          position: 'header',
          timestamp: Date.now()
        }
      },
      commonEvents: [
        'page_view',
        'button_click', 
        'form_submit',
        'download',
        'video_play',
        'search',
        'purchase',
        'signup'
      ]
    });
    
  } catch (error) {
    console.error('Events GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}