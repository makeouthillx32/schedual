// app/api/calendar/sls-events/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const {
      title,
      description,
      event_date,
      start_time,
      end_time,
      event_type,
      user_id, // The selected user from SLS Manager
      user_role, // The role of the selected user
      notes,
      location,
      is_virtual,
      virtual_meeting_link,
      priority = 'medium',
      created_by_id // The admin who is creating this event
    } = await request.json();

    console.log('Creating SLS event with data:', {
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
      return NextResponse.json(
        { error: 'Missing required fields: title, event_date, start_time, end_time, user_id, created_by_id' },
        { status: 400 }
      );
    }

    // Get the event type ID for SLS events (or default)
    let event_type_id = null;
    if (event_type) {
      const { data: eventType, error: eventTypeError } = await supabase
        .from('event_types')
        .select('id')
        .eq('name', event_type)
        .single();

      if (eventTypeError) {
        console.log('Event type not found, will use null');
      } else {
        event_type_id = eventType.id;
      }
    }

    // Determine client_id and coach_id based on user role
    let client_id = null;
    let coach_id = null;

    if (user_role === 'client7x') {
      client_id = user_id;
      // For client events, we might want to assign their primary coach
      // For now, leave coach_id as null unless we implement coach assignment logic
    } else if (user_role === 'coachx7') {
      coach_id = user_id;
      // For coach events, leave client_id as null (this is a coach-only event)
    }

    // Create the calendar event
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .insert({
        title: `SLS: ${title}`, // Prefix with SLS to identify these events
        description: description || `SLS event created for ${user_role === 'client7x' ? 'client' : 'coach'}`,
        event_type_id,
        client_id, // Maps to client_profile_id in your schema
        coach_id, // Maps to coach_profile_id in your schema  
        event_date,
        start_time,
        end_time,
        location,
        is_virtual: is_virtual || false,
        virtual_meeting_link,
        status: 'scheduled',
        priority,
        notes,
        created_by: created_by_id
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error creating calendar event:', eventError);
      return NextResponse.json(
        { error: 'Failed to create calendar event', details: eventError.message },
        { status: 500 }
      );
    }

    // Create calendar permissions so the event is visible to the right people
    const permissionsToCreate = [];

    // If it's a client event, give the client read access
    if (client_id) {
      permissionsToCreate.push({
        calendar_owner_id: client_id,
        calendar_owner_type: 'client',
        shared_with_id: created_by_id,
        shared_with_type: 'admin', // Note: may need to adjust based on your schema
        permission_level: 'admin',
        granted_by: created_by_id
      });
    }

    // If it's a coach event, give the coach read access
    if (coach_id) {
      permissionsToCreate.push({
        calendar_owner_id: coach_id,
        calendar_owner_type: 'coach',
        shared_with_id: created_by_id,
        shared_with_type: 'admin', // Note: may need to adjust based on your schema
        permission_level: 'admin',
        granted_by: created_by_id
      });
    }

    // Insert permissions if we have any to create
    if (permissionsToCreate.length > 0) {
      const { error: permissionError } = await supabase
        .from('calendar_permissions')
        .insert(permissionsToCreate);

      if (permissionError) {
        console.warn('Warning: Could not create calendar permissions:', permissionError.message);
        // Don't fail the whole request for permission errors
      }
    }

    console.log('SLS event created successfully:', event);

    return NextResponse.json({
      success: true,
      event,
      message: 'SLS event created successfully'
    });

  } catch (error) {
    console.error('Error in SLS event creation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve SLS events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const user_role = searchParams.get('user_role');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    let query = supabase
      .from('calendar_events')
      .select(`
        *,
        event_types (
          name,
          color_code
        )
      `)
      .ilike('title', 'SLS:%'); // Only get SLS events

    // Filter by user if provided
    if (user_id && user_role) {
      if (user_role === 'client7x') {
        query = query.eq('client_id', user_id);
      } else if (user_role === 'coachx7') {
        query = query.eq('coach_id', user_id);
      }
    }

    // Filter by date range if provided
    if (start_date) {
      query = query.gte('event_date', start_date);
    }
    if (end_date) {
      query = query.lte('event_date', end_date);
    }

    // Order by date and time
    query = query.order('event_date', { ascending: true })
                 .order('start_time', { ascending: true });

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching SLS events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch SLS events', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      events: events || []
    });

  } catch (error) {
    console.error('Error in SLS events retrieval:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}