// app/api/analytics/performance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface PerformancePayload {
  sessionId: string;
  pageUrl: string;
  metrics: {
    type: 'LCP' | 'FID' | 'CLS' | 'TTFB';
    value: number;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const payload: PerformancePayload = await request.json();
    
    // Find the user by session_id
    const { data: user } = await supabase
      .from('analytics_users')
      .select('id, device_type, browser')
      .eq('session_id', payload.sessionId)
      .single();
    
    if (!user) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // Create performance records for each metric
    const performanceRecords = payload.metrics.map(metric => ({
      user_id: user.id,
      session_id: payload.sessionId,
      page_url: payload.pageUrl,
      metric_type: metric.type,
      metric_value: metric.value,
      device_type: user.device_type,
      browser: user.browser,
    }));
    
    const { error: performanceError } = await supabase
      .from('analytics_performance')
      .insert(performanceRecords);
    
    if (performanceError) {
      console.error('Error creating performance metrics:', performanceError);
      return NextResponse.json({ error: 'Failed to track performance' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Performance tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}