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

    // Get event type ID - FIXED to properly handle SLS events
    let event_type_id = null;
    
    // Always try to get "SLS Event" type first since this is an SLS-specific API
    console.log('🔍 Looking up SLS Event type in database...');
    const { data: slsEventType, error: slsError } = await supabase
      .from('event_types')
      .select('id, name, color_code')
      .ilike('name', 'SLS Event')
      .single();

    if (slsError) {
      console.warn('⚠️ SLS Event type not found, attempting to create it:', slsError.message);
      
      // Try to create the SLS Event type if it doesn't exist
      const { data: createdType, error: createError } = await supabase
        .from('event_types')
        .insert({
          name: 'SLS Event',
          description: 'Supported Living Services event',
          color_code: '#10B981', // Green color for SLS events
          is_active: true
        })
        .select('id, name, color_code')
        .single();

      if (createError) {
        console.error('❌ Failed to create SLS Event type:', createError.message);
        
        // Fallback: try to find any event type or use null
        const { data: fallbackType } = await supabase
          .from('event_types')
          .select('id, name, color_code')
          .limit(1)
          .single();
        
        if (fallbackType) {
          event_type_id = fallbackType.id;
          console.log('🔄 Using fallback event type:', fallbackType.name, 'ID:', event_type_id);
        } else {
          console.warn('⚠️ No event types found at all, proceeding with null');
        }
      } else {
        event_type_id = createdType.id;
        console.log('✅ Created new SLS Event type, ID:', event_type_id);
      }
    } else {
      event_type_id = slsEventType.id;
      console.log('✅ Found existing SLS Event type:', slsEventType.name, 'ID:', event_type_id);
    }

    // If user provided a specific event_type parameter, respect it but map it appropriately
    if (event_type) {
      console.log('🎯 User provided event_type parameter:', event_type);
      
      // Map common SLS event subtypes to the main SLS Event type
      const slsEventSubtypes = ['appointment', 'meeting', 'training', 'assessment', 'follow-up'];
      
      if (slsEventSubtypes.includes(event_type.toLowerCase())) {
        console.log('📝 Mapping', event_type, 'to SLS Event type (keeping SLS Event as main type)');
        // Keep the SLS Event type but note the subtype in description
      } else {
        // Try to find the specific event type they requested
        const { data: specificType, error: specificError } = await supabase
          .from('event_types')
          .select('id, name, color_code')
          .ilike('name', event_type)
          .single();

        if (!specificError && specificType) {
          event_type_id = specificType.id;
          console.log('✅ Using specific event type:', specificType.name, 'ID:', event_type_id);
        } else {
          console.log('⚠️ Specific event type not found, keeping SLS Event type');
        }
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
      description: description || `SLS ${event_type || 'event'} created for ${user_role === 'client7x' ? 'client' : 'coach'}`,
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

    console.log('💾 About to insert SLS event data:', JSON.stringify({
      ...eventData,
      event_type_info: event_type_id ? 'SLS Event type found' : 'No event type (will be null)'
    }, null, 2));

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

    console.log('✅ SLS event created successfully:', {
      id: event.id,
      title: event.title,
      event_type_id: event.event_type_id,
      event_date: event.event_date,
      start_time: event.start_time
    });

    return NextResponse.json({
      success: true,
      event,
      message: 'SLS event created successfully',
      event_type_used: event_type_id ? 'SLS Event' : 'null (no event type)',
      event_type_id
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