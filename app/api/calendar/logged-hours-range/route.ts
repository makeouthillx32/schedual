// app/api/calendar/logged-hours-range/route.ts - Updated to filter out orphaned records
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
    const include_orphaned = searchParams.get('include_orphaned'); // Optional parameter for debugging

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
      end_date,
      include_orphaned: !!include_orphaned
    });

    // Build the query
    let query = supabase
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
        calendar_event_id,
        work_locations!work_location_id (
          location_name,
          location_type,
          city
        )
      `)
      .eq('coach_profile_id', targetCoachId)
      .gte('report_date', start_date)
      .lte('report_date', end_date);

    // Filter out orphaned records (calendar_event_id is NULL) unless specifically requested
    if (!include_orphaned) {
      query = query.not('calendar_event_id', 'is', null);
    }

    // Order by date
    query = query.order('report_date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('[API] Error fetching logged hours range:', error);
      return NextResponse.json(
        { error: 'Failed to fetch logged hours' },
        { status: 500 }
      );
    }

    // Separate linked and orphaned records for logging
    const linkedRecords = data?.filter(record => record.calendar_event_id) || [];
    const orphanedRecords = data?.filter(record => !record.calendar_event_id) || [];

    console.log('[API] Found logged hours:', {
      total: data?.length || 0,
      linked: linkedRecords.length,
      orphaned: orphanedRecords.length,
      filtered_out_orphaned: !include_orphaned && orphanedRecords.length > 0
    });

    // If there are orphaned records, log a warning
    if (orphanedRecords.length > 0 && !include_orphaned) {
      console.warn('[API] ⚠️ Filtered out', orphanedRecords.length, 'orphaned records (no calendar_event_id)');
      console.warn('[API] 💡 Add ?include_orphaned=true to see them, or run cleanup to remove them');
    }

    // For the response, only return the data we're actually sending
    const responseData = include_orphaned ? data : linkedRecords;

    // Add metadata to response for debugging
    const response = {
      data: responseData || [],
      metadata: {
        total_records_found: data?.length || 0,
        linked_records: linkedRecords.length,
        orphaned_records: orphanedRecords.length,
        returned_records: responseData?.length || 0,
        filtered_orphaned: !include_orphaned,
        date_range: { start_date, end_date },
        coach_id: targetCoachId
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Manually clean up orphaned records in date range (admin only)
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

    // Check if user is admin (you might want to add this check)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin1') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { start_date, end_date, coach_id } = body;

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      );
    }

    console.log('[API] Admin cleanup request for orphaned records:', { 
      start_date, 
      end_date, 
      coach_id: coach_id || 'all coaches' 
    });

    // Build delete query
    let deleteQuery = supabase
      .from('coach_daily_reports')
      .delete()
      .is('calendar_event_id', null)
      .gte('report_date', start_date)
      .lte('report_date', end_date);

    // Filter by specific coach if provided
    if (coach_id) {
      deleteQuery = deleteQuery.eq('coach_profile_id', coach_id);
    }

    const { data, error } = await deleteQuery.select('id, report_date, activity_type, hours_worked');

    if (error) {
      console.error('[API] Error cleaning up orphaned records:', error);
      return NextResponse.json(
        { error: 'Failed to clean up orphaned records' },
        { status: 500 }
      );
    }

    console.log('[API] ✅ Cleaned up', data?.length || 0, 'orphaned records');

    return NextResponse.json({
      success: true,
      cleaned_records: data?.length || 0,
      message: `Successfully cleaned up ${data?.length || 0} orphaned records`,
      cleaned_data: data
    });

  } catch (error) {
    console.error('[API] Unexpected error during cleanup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}