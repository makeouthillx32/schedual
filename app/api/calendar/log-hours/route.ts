// app/api/calendar/log-hours/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      report_date,
      hours_worked,
      location,
      activity_type,
      notes,
      coach_id,
      coach_name
    } = body;

    console.log('[API] Logging hours for coach:', coach_id, body);

    // Validate required fields
    if (!report_date || !hours_worked || !activity_type) {
      return NextResponse.json(
        { error: 'Missing required fields: report_date, hours_worked, activity_type' },
        { status: 400 }
      );
    }

    // Validate hours range
    if (hours_worked < 0.25 || hours_worked > 12) {
      return NextResponse.json(
        { error: 'Hours worked must be between 0.25 and 12' },
        { status: 400 }
      );
    }

    // Verify user has coach role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Failed to verify user profile' },
        { status: 403 }
      );
    }

    if (profile.role !== 'coachx7') {
      return NextResponse.json(
        { error: 'Only coaches can log hours' },
        { status: 403 }
      );
    }

    // Insert or update coach daily report
    const { data: reportData, error: reportError } = await supabase
      .from('coach_daily_reports')
      .upsert({
        coach_profile_id: user.id,
        report_date,
        hours_worked,
        location: location || 'Main Office',
        activity_type,
        notes: notes || '',
        created_by: user.id
      }, {
        onConflict: 'coach_profile_id,report_date',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (reportError) {
      console.error('[API] Error inserting coach report:', reportError);
      return NextResponse.json(
        { error: 'Failed to log hours: ' + reportError.message },
        { status: 500 }
      );
    }

    console.log('[API] ✅ Hours logged successfully:', reportData);

    // Create a calendar event for the logged hours
    try {
      const eventTitle = `${hours_worked}h - ${activity_type}`;
      const eventDescription = `${coach_name || 'Coach'} logged ${hours_worked} hours for ${activity_type}${location ? ` at ${location}` : ''}${notes ? `\n\nNotes: ${notes}` : ''}`;

      const { data: eventData, error: eventError } = await supabase
        .from('calendar_events')
        .upsert({
          title: eventTitle,
          description: eventDescription,
          event_date: report_date,
          start_time: '09:00',
          end_time: '17:00',
          event_type_id: null, // We'll need to handle this
          coach_profile_id: user.id,
          client_profile_id: null,
          location: location || 'Main Office',
          is_virtual: false,
          status: 'completed',
          priority: 'medium',
          created_by: user.id,
          // Add a special field to identify this as a hours log event
          notes: `HOUR_LOG:${reportData.id}`
        }, {
          onConflict: 'coach_profile_id,event_date,title', // Avoid duplicates
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (eventError) {
        console.warn('[API] Failed to create calendar event (but hours logged):', eventError);
        // Don't fail the whole request if calendar event creation fails
      } else {
        console.log('[API] ✅ Calendar event created:', eventData);
      }
    } catch (eventErr) {
      console.warn('[API] Calendar event creation failed:', eventErr);
      // Continue - the hours are logged even if calendar event fails
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      message: `Successfully logged ${hours_worked} hours for ${activity_type}`
    });

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve logged hours for a specific date
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const coach_id = searchParams.get('coach_id');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Use coach_id if provided, otherwise use current user
    const targetCoachId = coach_id || user.id;

    // Get logged hours for the specific date
    const { data, error } = await supabase
      .from('coach_daily_reports')
      .select('hours_worked')
      .eq('coach_profile_id', targetCoachId)
      .eq('report_date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('[API] Error fetching logged hours:', error);
      return NextResponse.json(
        { error: 'Failed to fetch logged hours' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      totalHours: data?.hours_worked || 0,
      date,
      coach_id: targetCoachId
    });

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}