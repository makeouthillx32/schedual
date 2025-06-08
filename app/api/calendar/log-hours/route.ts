// app/api/calendar/logged-hours/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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