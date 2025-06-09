// app/api/calendar/log-hours/route.ts - Updated to work with calendar event linking
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch logged hours for a specific date
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
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

    console.log('[API] Getting logged hours for:', { date, targetCoachId });

    // Get logged hours for the specific date (include calendar_event_id for debugging)
    const { data, error } = await supabase
      .from('coach_daily_reports')
      .select('hours_worked, calendar_event_id, activity_type, location, notes')
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

    const totalHours = data?.hours_worked || 0;
    console.log('[API] Found logged hours:', { 
      totalHours, 
      hasCalendarEvent: !!data?.calendar_event_id,
      activity: data?.activity_type 
    });

    return NextResponse.json({
      totalHours,
      date,
      coach_id: targetCoachId,
      calendar_event_id: data?.calendar_event_id,
      activity_type: data?.activity_type,
      location: data?.location,
      notes: data?.notes,
      isLinkedToCalendar: !!data?.calendar_event_id
    });

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Log new hours for a coach
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      report_date,
      hours_worked,
      work_location_id,
      location,
      activity_type,
      notes,
      coach_id,
      coach_name,
      initials
    } = body;

    console.log('[API] Logging hours:', {
      report_date,
      hours_worked,
      work_location_id,
      location,
      activity_type,
      initials,
      coach_id: coach_id || user.id
    });

    // Validate required fields (either work_location_id OR location text)
    if (!report_date || !hours_worked || !activity_type) {
      return NextResponse.json(
        { error: 'Missing required fields: report_date, hours_worked, activity_type' },
        { status: 400 }
      );
    }

    if (!work_location_id && (!location || location.trim() === '')) {
      return NextResponse.json(
        { error: 'Either work_location_id or location text is required' },
        { status: 400 }
      );
    }

    // Validate hours_worked is within acceptable range
    if (hours_worked < 0.25 || hours_worked > 12) {
      return NextResponse.json(
        { error: 'Hours worked must be between 0.25 and 12' },
        { status: 400 }
      );
    }

    // Use coach_id if provided, otherwise use current user
    const targetCoachId = coach_id || user.id;

    // Insert into coach_daily_reports table
    // The trigger will automatically create the calendar event and link it
    const { data: reportData, error: insertError } = await supabase
      .from('coach_daily_reports')
      .insert({
        coach_profile_id: targetCoachId,
        report_date,
        hours_worked,
        work_location_id: work_location_id || null,
        location: location || null,
        activity_type,
        notes,
        initials,
        created_by: user.id // Who logged it (could be admin logging for coach)
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('[API] Error inserting coach daily report:', insertError);
      
      // Handle unique constraint violation (duplicate entry for same date)
      if (insertError.code === '23505' && insertError.message.includes('coach_daily_reports_coach_profile_id_report_date_key')) {
        return NextResponse.json(
          { error: 'Hours already logged for this date. Use update to modify existing entry.' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to log hours: ' + insertError.message },
        { status: 500 }
      );
    }

    console.log('[API] ✅ Hours logged successfully:', reportData);

    // Wait a brief moment for the trigger to complete, then fetch the updated record
    setTimeout(async () => {
      try {
        const { data: updatedData, error: fetchError } = await supabase
          .from('coach_daily_reports')
          .select('calendar_event_id')
          .eq('id', reportData.id)
          .single();

        if (!fetchError && updatedData?.calendar_event_id) {
          console.log('[API] 🎯 Calendar event linked successfully:', updatedData.calendar_event_id);
        } else {
          console.warn('[API] ⚠️ Calendar event may not have been linked yet');
        }
      } catch (e) {
        console.warn('[API] Could not verify calendar event linking:', e);
      }
    }, 200); // 200ms delay to allow trigger to complete

    // For immediate response, we'll refetch the record to see if trigger completed
    let finalData = reportData;
    try {
      const { data: quickCheck } = await supabase
        .from('coach_daily_reports')
        .select('calendar_event_id')
        .eq('id', reportData.id)
        .single();
      
      if (quickCheck?.calendar_event_id) {
        finalData = { ...reportData, calendar_event_id: quickCheck.calendar_event_id };
        console.log('[API] 🚀 Calendar event linked immediately:', quickCheck.calendar_event_id);
      }
    } catch (e) {
      // Ignore quick check errors
    }

    return NextResponse.json({
      success: true,
      data: finalData,
      message: `Successfully logged ${hours_worked} hours for ${activity_type}`,
      calendar_event_created: !!finalData.calendar_event_id,
      calendar_event_id: finalData.calendar_event_id
    });

  } catch (error) {
    console.error('[API] Unexpected error logging hours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update existing logged hours
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      report_date,
      hours_worked,
      work_location_id, // Added this field that was missing
      location,
      activity_type,
      notes,
      coach_id,
      initials
    } = body;

    console.log('[API] Updating hours:', {
      report_date,
      hours_worked,
      work_location_id,
      location,
      activity_type,
      coach_id: coach_id || user.id
    });

    // Validate required fields
    if (!report_date || !hours_worked || !activity_type) {
      return NextResponse.json(
        { error: 'Missing required fields: report_date, hours_worked, activity_type' },
        { status: 400 }
      );
    }

    if (!work_location_id && (!location || location.trim() === '')) {
      return NextResponse.json(
        { error: 'Either work_location_id or location text is required' },
        { status: 400 }
      );
    }

    // Validate hours_worked is within acceptable range
    if (hours_worked < 0.25 || hours_worked > 12) {
      return NextResponse.json(
        { error: 'Hours worked must be between 0.25 and 12' },
        { status: 400 }
      );
    }

    // Use coach_id if provided, otherwise use current user
    const targetCoachId = coach_id || user.id;

    // Update the existing record
    // The trigger will automatically update the linked calendar event
    const { data, error } = await supabase
      .from('coach_daily_reports')
      .update({
        hours_worked,
        work_location_id: work_location_id || null,
        location: location || null,
        activity_type,
        notes,
        initials
      })
      .eq('coach_profile_id', targetCoachId)
      .eq('report_date', report_date)
      .select('*, calendar_event_id')
      .single();

    if (error) {
      console.error('[API] Error updating coach daily report:', error);
      return NextResponse.json(
        { error: 'Failed to update hours: ' + error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No existing hours found for this date' },
        { status: 404 }
      );
    }

    console.log('[API] ✅ Hours updated successfully:', {
      id: data.id,
      calendar_event_id: data.calendar_event_id,
      isLinked: !!data.calendar_event_id
    });

    return NextResponse.json({
      success: true,
      data,
      message: `Successfully updated hours to ${hours_worked} for ${activity_type}`,
      calendar_event_updated: !!data.calendar_event_id,
      calendar_event_id: data.calendar_event_id
    });

  } catch (error) {
    console.error('[API] Unexpected error updating hours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove logged hours and linked calendar event
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const report_date = searchParams.get('date');
    const coach_id = searchParams.get('coach_id');

    if (!report_date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Use coach_id if provided, otherwise use current user
    const targetCoachId = coach_id || user.id;

    console.log('[API] Deleting hours for:', { report_date, targetCoachId });

    // Delete the coach report
    // The trigger will automatically delete the linked calendar event
    const { data, error } = await supabase
      .from('coach_daily_reports')
      .delete()
      .eq('coach_profile_id', targetCoachId)
      .eq('report_date', report_date)
      .select('calendar_event_id, activity_type, hours_worked')
      .single();

    if (error) {
      console.error('[API] Error deleting coach daily report:', error);
      return NextResponse.json(
        { error: 'Failed to delete hours: ' + error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No hours found for this date' },
        { status: 404 }
      );
    }

    console.log('[API] ✅ Hours deleted successfully:', {
      activity: data.activity_type,
      hours: data.hours_worked,
      had_calendar_event: !!data.calendar_event_id
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${data.hours_worked} hours for ${data.activity_type}`,
      calendar_event_deleted: !!data.calendar_event_id
    });

  } catch (error) {
    console.error('[API] Unexpected error deleting hours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}