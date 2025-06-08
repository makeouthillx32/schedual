// app/api/calendar/logged-hours-range/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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
    const coach_id = searchParams.get('coach_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'start_date and end_date parameters are required' },
        { status: 400 }
      );
    }

    // Use coach_id if provided, otherwise use current user
    const targetCoachId = coach_id || user.id;

    console.log('[API] Getting logged hours range for:', { 
      targetCoachId, 
      start_date, 
      end_date 
    });

    // Get logged hours for the date range with location names
    const { data, error } = await supabase
      .from('coach_daily_reports')
      .select(`
        id,
        report_date,
        hours_worked,
        location,
        activity_type,
        notes,
        initials,
        created_at,
        work_locations!work_location_id (
          location_name,
          location_type,
          city
        )
      `)
      .eq('coach_profile_id', targetCoachId)
      .gte('report_date', start_date)
      .lte('report_date', end_date)
      .order('report_date', { ascending: true });

    if (error) {
      console.error('[API] Error fetching logged hours range:', error);
      return NextResponse.json(
        { error: 'Failed to fetch logged hours' },
        { status: 500 }
      );
    }

    console.log('[API] Found logged hours:', data?.length || 0, 'entries');

    return NextResponse.json(data || []);

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}