// app/api/analytics/devices/route.ts - UPDATED TO READ LIVE DATA
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface DeviceAnalytics {
  device_type: string;
  sessions_count: number;
  users_count: number;
  page_views_count: number;
  bounce_rate: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('end') || new Date().toISOString();

    console.log('🔍 Fetching device data for date range:', { startDate, endDate });

    // Try aggregated data first (faster)
    const { data: deviceStats, error: deviceStatsError } = await supabase
      .from('analytics_device_stats')
      .select('device_type, browser, os, sessions_count, users_count, page_views_count, bounce_rate')
      .gte('date', startDate.split('T')[0])
      .lte('date', endDate.split('T')[0]);

    let devices: DeviceAnalytics[] = [];

    if (deviceStats && deviceStats.length > 0) {
      console.log('✅ Using aggregated device stats:', deviceStats.length, 'records');
      
      // Use aggregated data
      const deviceTotals = new Map<string, {
        device_type: string;
        sessions_count: number;
        users_count: number;
        page_views_count: number;
        bounce_rate: number;
        count: number;
      }>();

      deviceStats.forEach(stat => {
        const existing = deviceTotals.get(stat.device_type) || {
          device_type: stat.device_type,
          sessions_count: 0,
          users_count: 0,
          page_views_count: 0,
          bounce_rate: 0,
          count: 0
        };

        existing.sessions_count += stat.sessions_count || 0;
        existing.users_count += stat.users_count || 0;
        existing.page_views_count += stat.page_views_count || 0;
        existing.bounce_rate += stat.bounce_rate || 0;
        existing.count += 1;

        deviceTotals.set(stat.device_type, existing);
      });

      devices = Array.from(deviceTotals.values()).map(device => ({
        device_type: device.device_type,
        sessions_count: device.sessions_count,
        users_count: device.users_count,
        page_views_count: device.page_views_count,
        bounce_rate: device.count > 0 ? Math.round(device.bounce_rate / device.count) : 0
      }));

    } else {
      console.log('📊 No aggregated data found, calculating from live sessions...');
      
      // Fallback to live data calculation
      const { data: sessions, error: sessionsError } = await supabase
        .from('analytics_sessions')
        .select(`
          device_type, 
          user_id, 
          is_bounce,
          session_id,
          created_at
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const { data: pageViews, error: pageViewsError } = await supabase
        .from('analytics_page_views')
        .select('session_id, user_id, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      console.log('📱 Live data found:', {
        sessions: sessions?.length || 0,
        pageViews: pageViews?.length || 0
      });

      if (sessions && !sessionsError) {
        const deviceMap = new Map<string, {
          sessions: Set<string>;
          users: Set<string>;
          bounces: number;
          pageViews: number;
        }>();

        // Process sessions by device type
        sessions.forEach(session => {
          const deviceType = session.device_type || 'unknown';
          const existing = deviceMap.get(deviceType) || {
            sessions: new Set(),
            users: new Set(),
            bounces: 0,
            pageViews: 0
          };

          existing.sessions.add(session.session_id);
          existing.users.add(session.user_id);
          if (session.is_bounce) existing.bounces++;

          deviceMap.set(deviceType, existing);
        });

        // Add page view counts by matching session_ids
        if (pageViews && !pageViewsError) {
          pageViews.forEach(pv => {
            // Find which device type this session belongs to
            const session = sessions.find(s => s.session_id === pv.session_id);
            if (session) {
              const deviceType = session.device_type || 'unknown';
              const existing = deviceMap.get(deviceType);
              if (existing) {
                existing.pageViews++;
              }
            }
          });
        }

        // Convert to response format
        devices = Array.from(deviceMap.entries()).map(([deviceType, data]) => ({
          device_type: deviceType,
          sessions_count: data.sessions.size,
          users_count: data.users.size,
          page_views_count: data.pageViews,
          bounce_rate: data.sessions.size > 0 ? Math.round((data.bounces / data.sessions.size) * 100) : 0
        }));

        console.log('✅ Calculated live device stats:', devices);
      }
    }

    // Sort by sessions count (highest first)
    devices.sort((a, b) => b.sessions_count - a.sessions_count);

    console.log('📊 Final device data:', devices);

    return NextResponse.json({ 
      devices: devices.length > 0 ? devices : [
        // Return at least some structure if no data
        { device_type: 'unknown', sessions_count: 0, users_count: 0, page_views_count: 0, bounce_rate: 0 }
      ]
    });

  } catch (error) {
    console.error('Device analytics API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      devices: [
        { device_type: 'unknown', sessions_count: 0, users_count: 0, page_views_count: 0, bounce_rate: 0 }
      ]
    }, { status: 500 });
  }
}