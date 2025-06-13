// app/api/calendar/events/route.ts - UPDATED with Event Type Permissions
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Fetch regular calendar events with event type permissions
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

    // Build query for calendar events with event type permissions
    let query = supabase
      .from('calendar_events')
      .select(`
        *,
        event_types (
          name,
          color_code,
          description,
          visible_to_coaches,
          visible_to_clients,
          visible_to_admins
        )
      `)
      .gte('event_date', start_date)
      .lte('event_date', end_date)
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true });

    // For now, get ALL events in the date range and filter in application logic
    // This is simpler and more reliable than complex SQL joins
    if (user_role === 'admin1') {
      // Admins see all events - no additional filtering at query level
    } else if (user_role === 'coachx7' && user_id) {
      // Get all events - we'll filter by permissions in the application logic
    } else if (user_role === 'client7x' && user_id) {
      // Get all events - we'll filter by permissions in the application logic
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

    // Filter events based on event type permissions (additional security layer)
    const filteredEvents = (events || []).filter(event => {
      const eventType = event.event_types;
      
      // If no event type, allow for admins only
      if (!eventType) {
        return user_role === 'admin1';
      }

      // Check permissions based on user role
      switch (user_role) {
        case 'admin1':
          return eventType.visible_to_admins !== false; // Admins see everything unless explicitly hidden
        case 'coachx7':
          // Coaches see events they're assigned to OR events visible to coaches
          return event.coach_id === user_id || eventType.visible_to_coaches === true;
        case 'client7x':
          // Clients see events they're assigned to OR events visible to clients
          return event.client_id === user_id || eventType.visible_to_clients === true;
        default:
          return false; // Unknown role, deny access
      }
    });

    console.log('[Calendar Events API] After permission filtering:', filteredEvents.length, 'events visible to', user_role);

    // Resolve user profiles for display names
    let userProfiles: any = {};
    
    if (filteredEvents && filteredEvents.length > 0) {
      const userIds = [
        ...new Set([
          ...filteredEvents.map(e => e.client_id).filter(Boolean),
          ...filteredEvents.map(e => e.coach_id).filter(Boolean)
        ])
      ];
      
      console.log('[Calendar Events API] Resolving display names for user IDs:', userIds);
      
      if (userIds.length > 0) {
        const { data: resolvedUsers, error: resolveError } = await supabase
          .rpc('resolve_display_names', { user_ids: userIds });
        
        if (resolveError) {
          console.error('[Calendar Events API] Error resolving display names:', resolveError);
          
          // FALLBACK: Try profiles table directly
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, display_name, email')
            .in('id', userIds);
          
          if (profiles && !profileError) {
            userProfiles = Object.fromEntries(profiles.map(p => [p.id, p]));
          }
        } else if (resolvedUsers) {
          userProfiles = Object.fromEntries(
            resolvedUsers.map((user: any) => [user.id, user])
          );
        }
      }
    }

    // Transform events to match expected format
    const transformedEvents = filteredEvents.map(event => {
      const clientProfile = userProfiles[event.client_id];
      const coachProfile = userProfiles[event.coach_id];
      
      const clientName = clientProfile?.display_name || clientProfile?.email || (event.client_id ? 'Unknown Client' : '');
      const coachName = coachProfile?.display_name || coachProfile?.email || (event.coach_id ? 'Unknown Coach' : '');

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
        is_hour_log: false,
        client_name: clientName,
        coach_name: coachName
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

// POST - Create regular calendar event (unchanged)
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

    if (!title || !event_date || !start_time || !end_time || !created_by_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, event_date, start_time, end_time, created_by_id' },
        { status: 400 }
      );
    }

    let event_type_id = null;
    if (event_type) {
      const { data: eventType } = await supabase
        .from('event_types')
        .select('id')
        .eq('name', event_type)
        .single();
      
      event_type_id = eventType?.id || null;
    }

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

// PUT and DELETE methods remain the same...
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

