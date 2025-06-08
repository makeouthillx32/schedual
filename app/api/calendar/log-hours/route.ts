// app/api/calendar/log-hours/route.ts
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

    const totalHours = data?.hours_worked || 0;
    console.log('[API] Found logged hours:', totalHours);

    return NextResponse.json({
      totalHours,
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
    const { data, error } = await supabase
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
      .select()
      .single();

    if (error) {
      console.error('[API] Error inserting coach daily report:', error);
      
      // Handle unique constraint violation (duplicate entry for same date)
      if (error.code === '23505' && error.message.includes('coach_daily_reports_coach_profile_id_report_date_key')) {
        return NextResponse.json(
          { error: 'Hours already logged for this date. Use update to modify existing entry.' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to log hours: ' + error.message },
        { status: 500 }
      );
    }

    console.log('[API] ✅ Hours logged successfully:', data);

    return NextResponse.json({
      success: true,
      data,
      message: `Successfully logged ${hours_worked} hours for ${activity_type}`
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
      location,
      activity_type,
      notes,
      coach_id
    } = body;

    console.log('[API] Updating hours:', {
      report_date,
      hours_worked,
      location,
      activity_type,
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

    // Update the existing record
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
      .select()
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

    console.log('[API] ✅ Hours updated successfully:', data);

    return NextResponse.json({
      success: true,
      data,
      message: `Successfully updated hours to ${hours_worked} for ${activity_type}`
    });

  } catch (error) {
    console.error('[API] Unexpected error updating hours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}