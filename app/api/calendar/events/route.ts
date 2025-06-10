// app/api/calendar/events/route.ts - Regular Calendar Events API with Profile Resolution
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Fetch regular calendar events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const user_id = searchParams.get('user_id');
    const user_role = searchParams.get('user_role');

    console.log('[Calendar Events API] GET request:', {
      start_date,
      end_date,
      user_id,
      user_role
    });

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      );
    }

    // Build query for calendar events
    let query = supabase
      .from('calendar_events')
      .select(`
        *,
        event_types (
          name,
          color_code,
          description
        )
      `)
      .gte('event_date', start_date)
      .lte('event_date', end_date)
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true });

    // Filter based on user role
    if (user_role === 'admin1') {
      // Admins see all events - no additional filtering
    } else if (user_role === 'coachx7' && user_id) {
      // Coaches see events where they are the coach
      query = query.eq('coach_id', user_id);
    } else if (user_role === 'client7x' && user_id) {
      // Clients see events where they are the client
      query = query.eq('client_id', user_id);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('[Calendar Events API] Error fetching events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch calendar events: ' + error.message },
        { status: 500 }
      );
    }

    console.log('[Calendar Events API] Found', events?.length || 0, 'calendar events');

    // NEW: Use our Supabase function to resolve display names efficiently
    let userProfiles: any = {};
    
    if (events && events.length > 0) {
      // Get unique user IDs from both client_id and coach_id
      const userIds = [
        ...new Set([
          ...events.map(e => e.client_id).filter(Boolean),
          ...events.map(e => e.coach_id).filter(Boolean)
        ])
      ];
      
      console.log('[Calendar Events API] Resolving display names for user IDs:', userIds);
      
      if (userIds.length > 0) {
        // Use our custom Supabase function to resolve display names
        const { data: resolvedUsers, error: resolveError } = await supabase
          .rpc('resolve_display_names', { user_ids: userIds });
        
        if (resolveError) {
          console.error('[Calendar Events API] Error resolving display names:', resolveError);
          
          // FALLBACK: If function fails, try profiles table directly
          console.log('[Calendar Events API] Function failed, falling back to profiles table...');
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, display_name, email')
            .in('id', userIds);
          
          if (profiles && !profileError) {
            userProfiles = Object.fromEntries(profiles.map(p => [p.id, p]));
            console.log('[Calendar Events API] Fallback successful - loaded', Object.keys(userProfiles).length, 'profiles');
          }
        } else if (resolvedUsers) {
          console.log('[Calendar Events API] Function resolved users:', resolvedUsers);
          // Create a lookup map: userId -> user data
          userProfiles = Object.fromEntries(
            resolvedUsers.map((user: any) => [user.id, user])
          );
          console.log('[Calendar Events API] Successfully resolved', Object.keys(userProfiles).length, 'display names via function');
        }
      }
    }

    // Transform events to match expected format
    const transformedEvents = (events || []).map(event => {
      // NEW: Resolve client and coach names from profiles
      const clientProfile = userProfiles[event.client_id];
      const coachProfile = userProfiles[event.coach_id];
      
      // Use display_name first, fallback to email, then to a default
      const clientName = clientProfile?.display_name || clientProfile?.email || (event.client_id ? 'Unknown Client' : '');
      const coachName = coachProfile?.display_name || coachProfile?.email || (event.coach_id ? 'Unknown Coach' : '');

      console.log('[Calendar Events API] Event mapping DEBUG:', {
        title: event.title,
        client_id: event.client_id,
        coach_id: event.coach_id,
        clientProfile: userProfiles[event.client_id],
        coachProfile: userProfiles[event.coach_id],
        allProfiles: Object.keys(userProfiles),
        client_name: clientName,
        coach_name: coachName
      });

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        start_time: event.start_time,
        end_time: event.end_time,
        event_type: event.event_types?.name || 'Event',
        color_code: event.event_types?.color_code || '#3B82F6',
        status: event.status,
        location: event.location,
        is_virtual: event.is_virtual,
        virtual_meeting_link: event.virtual_meeting_link,
        duration_minutes: event.duration_minutes,
        priority: event.priority,
        notes: event.notes,
        is_hour_log: false, // Regular events are not hour logs
        client_name: clientName, // NOW RESOLVED FROM PROFILES
        coach_name: coachName    // NOW RESOLVED FROM PROFILES
      };
    });

    return NextResponse.json(transformedEvents);

  } catch (error) {
    console.error('[Calendar Events API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create regular calendar event
export async function POST(request: Request) {
  try {
    const eventData = await request.json();
    console.log('[Calendar Events API] Creating event:', eventData);

    const {
      title,
      description,
      event_date,
      start_time,
      end_time,
      event_type,
      location,
      is_virtual,
      virtual_meeting_link,
      priority = 'medium',
      notes,
      created_by_id,
      client_id,
      coach_id
    } = eventData;

    // Validate required fields
    if (!title || !event_date || !start_time || !end_time || !created_by_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, event_date, start_time, end_time, created_by_id' },
        { status: 400 }
      );
    }

    // Get event type ID if provided
    let event_type_id = null;
    if (event_type) {
      const { data: eventType } = await supabase
        .from('event_types')
        .select('id')
        .eq('name', event_type)
        .single();
      
      event_type_id = eventType?.id || null;
    }

    // Create the calendar event
    const { data: event, error } = await supabase
      .from('calendar_events')
      .insert({
        title,
        description,
        event_type_id,
        client_id,
        coach_id,
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

    if (error) {
      console.error('[Calendar Events API] Error creating event:', error);
      return NextResponse.json(
        { error: 'Failed to create calendar event: ' + error.message },
        { status: 500 }
      );
    }

    console.log('[Calendar Events API] ✅ Event created successfully:', event);

    return NextResponse.json({
      success: true,
      event,
      message: 'Calendar event created successfully'
    });

  } catch (error) {
    console.error('[Calendar Events API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update calendar event
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');
    const eventData = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    console.log('[Calendar Events API] Updating event:', eventId, eventData);

    const { data: event, error } = await supabase
      .from('calendar_events')
      .update(eventData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('[Calendar Events API] Error updating event:', error);
      return NextResponse.json(
        { error: 'Failed to update calendar event: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
      message: 'Calendar event updated successfully'
    });

  } catch (error) {
    console.error('[Calendar Events API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete calendar event
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    console.log('[Calendar Events API] Deleting event:', eventId);

    const { data: event, error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('[Calendar Events API] Error deleting event:', error);
      return NextResponse.json(
        { error: 'Failed to delete calendar event: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Calendar event deleted successfully'
    });

  } catch (error) {
    console.error('[Calendar Events API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}