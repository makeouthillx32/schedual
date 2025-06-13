// app/api/calendar/events/route.ts - FIXED VERSION
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

    // Simple query - get all events in date range with event type info
    const { data: events, error } = await supabase
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

    if (error) {
      console.error('[Calendar Events API] Error fetching events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch calendar events: ' + error.message },
        { status: 500 }
      );
    }

    console.log('[Calendar Events API] Raw events from DB:', events?.length || 0);
    
    // Filter events based on user role and event type permissions
    const filteredEvents = (events || []).filter(event => {
      const eventType = event.event_types;
      
      console.log('[Calendar Events API] Processing event:', {
        title: event.title,
        event_type: eventType?.name,
        coach_id: event.coach_id,
        client_id: event.client_id,
        visible_to_coaches: eventType?.visible_to_coaches,
        visible_to_clients: eventType?.visible_to_clients,
        visible_to_admins: eventType?.visible_to_admins,
        user_role,
        user_id
      });

      // If no event type, allow for admins only
      if (!eventType) {
        console.log('[Calendar Events API] No event type, allowing for admins only');
        return user_role === 'admin1';
      }

      // Check permissions based on user role
      switch (user_role) {
        case 'admin1':
          // Admins see everything unless explicitly hidden
          const adminCanSee = eventType.visible_to_admins !== false;
          console.log('[Calendar Events API] Admin visibility:', adminCanSee);
          return adminCanSee;
          
        case 'coachx7':
          // Coaches see events they're assigned to OR events visible to coaches
          const isAssignedCoach = event.coach_id === user_id;
          const visibleToCoaches = eventType.visible_to_coaches === true;
          const coachCanSee = isAssignedCoach || visibleToCoaches;
          console.log('[Calendar Events API] Coach visibility:', {
            isAssignedCoach,
            visibleToCoaches,
            canSee: coachCanSee
          });
          return coachCanSee;
          
        case 'client7x':
          // Clients see events they're assigned to OR events visible to clients
          const isAssignedClient = event.client_id === user_id;
          const visibleToClients = eventType.visible_to_clients === true;
          const clientCanSee = isAssignedClient || visibleToClients;
          console.log('[Calendar Events API] Client visibility:', {
            isAssignedClient,
            visibleToClients,
            canSee: clientCanSee
          });
          return clientCanSee;
          
        default:
          console.log('[Calendar Events API] Unknown role, denying access');
          return false;
      }
    });

    console.log('[Calendar Events API] After filtering:', filteredEvents.length, 'events visible to', user_role);

    // If no events after filtering, return empty array
    if (!filteredEvents || filteredEvents.length === 0) {
      console.log('[Calendar Events API] No events passed filtering, returning empty array');
      return NextResponse.json([]);
    }

    // Resolve user profiles for display names
    let userProfiles: any = {};
    
    const userIds = [
      ...new Set([
        ...filteredEvents.map(e => e.client_id).filter(Boolean),
        ...filteredEvents.map(e => e.coach_id).filter(Boolean)
      ])
    ];
    
    if (userIds.length > 0) {
      console.log('[Calendar Events API] Resolving display names for:', userIds);
      
      try {
        const { data: resolvedUsers, error: resolveError } = await supabase
          .rpc('resolve_display_names', { user_ids: userIds });
        
        if (resolveError) {
          console.warn('[Calendar Events API] RPC failed, using fallback:', resolveError);
          
          // FALLBACK: Try profiles table directly
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, display_name, email')
            .in('id', userIds);
          
          if (profiles && !profileError) {
            userProfiles = Object.fromEntries(profiles.map(p => [p.id, p]));
            console.log('[Calendar Events API] Fallback loaded profiles:', Object.keys(userProfiles).length);
          }
        } else if (resolvedUsers) {
          userProfiles = Object.fromEntries(
            resolvedUsers.map((user: any) => [user.id, user])
          );
          console.log('[Calendar Events API] RPC loaded profiles:', Object.keys(userProfiles).length);
        }
      } catch (profileError) {
        console.warn('[Calendar Events API] Profile resolution failed:', profileError);
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

    console.log('[Calendar Events API] Returning', transformedEvents.length, 'transformed events');
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

