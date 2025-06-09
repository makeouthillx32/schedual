// app/api/calendar/sls-events/route.ts - Debug version
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Add a simple GET method to test if the route is working
export async function GET() {
  console.log('🟢 SLS Events API route is working!');
  return NextResponse.json({ 
    message: 'SLS Events API is working',
    timestamp: new Date().toISOString(),
    path: '/api/calendar/sls-events'
  });
}

export async function POST(request: Request) {
  console.log('🚀 SLS Events API POST called');
  
  try {
    const requestBody = await request.json();
    console.log('📝 SLS API received request body:', JSON.stringify(requestBody, null, 2));

    const {
      title,
      description,
      event_date,
      start_time,
      end_time,
      event_type,
      user_id,
      user_role,
      notes,
      location,
      is_virtual,
      virtual_meeting_link,
      priority = 'medium',
      created_by_id
    } = requestBody;

    console.log('🎯 Creating SLS event with parsed data:', {
      title,
      event_date,
      start_time,
      end_time,
      user_id,
      user_role,
      created_by_id
    });

    // Validate required fields
    if (!title || !event_date || !start_time || !end_time || !user_id || !created_by_id) {
      console.error('❌ Missing required fields:', {
        title: !!title,
        event_date: !!event_date,
        start_time: !!start_time,
        end_time: !!end_time,
        user_id: !!user_id,
        created_by_id: !!created_by_id
      });
      return NextResponse.json(
        { error: 'Missing required fields: title, event_date, start_time, end_time, user_id, created_by_id' },
        { status: 400 }
      );
    }

    // Get event type ID if provided
    let event_type_id = null;
    if (event_type) {
      console.log('🔍 Looking up event type:', event_type);
      const { data: eventType, error: eventTypeError } = await supabase
        .from('event_types')
        .select('id')
        .ilike('name', event_type)
        .single();

      if (eventTypeError) {
        console.log('⚠️ Event type not found:', eventTypeError.message);
      } else {
        event_type_id = eventType.id;
        console.log('✅ Found event type ID:', event_type_id);
      }
    }

    // Determine client_id and coach_id based on user role
    let client_id = null;
    let coach_id = null;

    if (user_role === 'client7x') {
      client_id = user_id;
      console.log('👤 Setting client_id:', client_id);
    } else if (user_role === 'coachx7') {
      coach_id = user_id;
      console.log('👨‍💼 Setting coach_id:', coach_id);
    }

    // Prepare the event data
    const eventData = {
      title: `SLS: ${title}`,
      description: description || `SLS event created for ${user_role === 'client7x' ? 'client' : 'coach'}`,
      event_type_id,
      client_id,
      coach_id,
      event_date,
      start_time,
      end_time,
      location: location || null,
      is_virtual: is_virtual || false,
      virtual_meeting_link: virtual_meeting_link || null,
      status: 'scheduled',
      priority,
      reminder_minutes: 60,
      notes: notes || null,
      created_by: created_by_id
    };

    console.log('💾 About to insert event data:', JSON.stringify(eventData, null, 2));

    // Create the calendar event
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select()
      .single();

    if (eventError) {
      console.error('❌ Supabase error creating calendar event:', eventError);
      return NextResponse.json(
        { 
          error: 'Failed to create calendar event', 
          details: eventError.message,
          code: eventError.code,
          hint: eventError.hint 
        },
        { status: 500 }
      );
    }

    console.log('✅ SLS event created successfully:', event);

    return NextResponse.json({
      success: true,
      event,
      message: 'SLS event created successfully'
    });

  } catch (error) {
    console.error('💥 Catch block error in SLS event creation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}