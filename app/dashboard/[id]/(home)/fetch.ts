import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Ensure the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total user count from auth.users (if you have access) or profiles table
    const { count: totalUsers, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching user count:', countError);
      return NextResponse.json({ error: 'Failed to fetch user statistics' }, { status: 500 });
    }

    // Calculate growth rate by comparing this month vs last month
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Users created this month
    const { count: thisMonthUsers, error: thisMonthError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayThisMonth.toISOString());

    // Users created last month
    const { count: lastMonthUsers, error: lastMonthError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayLastMonth.toISOString())
      .lt('created_at', firstDayThisMonth.toISOString());

    if (thisMonthError || lastMonthError) {
      console.error('Error fetching monthly user data:', thisMonthError || lastMonthError);
      // Return basic stats without growth rate
      return NextResponse.json({
        totalUsers: totalUsers || 0,
        growthRate: 0,
      });
    }

    // Calculate growth rate percentage
    let growthRate = 0;
    if (lastMonthUsers && lastMonthUsers > 0) {
      growthRate = ((thisMonthUsers || 0) - lastMonthUsers) / lastMonthUsers;
    } else if (thisMonthUsers && thisMonthUsers > 0) {
      growthRate = 1; // 100% growth if no users last month but some this month
    }

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      thisMonthUsers: thisMonthUsers || 0,
      lastMonthUsers: lastMonthUsers || 0,
      growthRate: Math.round(growthRate * 10000) / 100, // Convert to percentage with 2 decimal places
    });

  } catch (error) {
    console.error('Unexpected error in users stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}