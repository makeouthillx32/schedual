// app/api/analytics/devices/route.ts - HYBRID: Real + Stored Data
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

    // =====================================================
    // STEP 1: Try to get aggregated (stored) data first
    // =====================================================
    const { data: storedStats, error: storedError } = await supabase
      .from('analytics_device_stats')
      .select('device_type, browser, os, sessions_count, users_count, page_views_count, bounce_rate, date')
      .gte('date', startDate.split('T')[0])
      .lte('date', endDate.split('T')[0]);

    let devices: DeviceAnalytics[] = [];
    let hasStoredData = storedStats && storedStats.length > 0;

    if (hasStoredData) {
      console.log('✅ Found stored aggregated data:', storedStats.length, 'records');
      
      // Aggregate stored data by device type
      const deviceTotals = new Map<string, {
        device_type: string;
        sessions_count: number;
        users_count: number;
        page_views_count: number;
        bounce_rate: number;
        count: number;
      }>();

      storedStats.forEach(stat => {
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
    }

    // =====================================================
    // STEP 2: Add real-time data for today (if needed)
    // =====================================================
    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date().toISOString().split('T')[0] + 'T00:00:00.000Z';
    const todayEnd = new Date().toISOString();

    // Check if we have today's aggregated data
    const hasTodaysStoredData = storedStats?.some(stat => stat.date === today);

    if (!hasTodaysStoredData) {
      console.log('📊 Adding real-time data for today...');
      
      // Get today's live data
      const { data: todaySessions, error: todaySessionsError } = await supabase
        .from('analytics_sessions')
        .select(`
          device_type, 
          user_id, 
          is_bounce,
          session_id,
          created_at
        `)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      const { data: todayPageViews, error: todayPageViewsError } = await supabase
        .from('analytics_page_views')
        .select('session_id, user_id, created_at')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      console.log('📱 Today\'s live data:', {
        sessions: todaySessions?.length || 0,
        pageViews: todayPageViews?.length || 0
      });

      if (todaySessions && !todaySessionsError) {
        const todayDeviceMap = new Map<string, {
          sessions: Set<string>;
          users: Set<string>;
          bounces: number;
          pageViews: number;
        }>();

        // Process today's sessions
        todaySessions.forEach(session => {
          const deviceType = session.device_type || 'unknown';
          const existing = todayDeviceMap.get(deviceType) || {
            sessions: new Set(),
            users: new Set(),
            bounces: 0,
            pageViews: 0
          };

          existing.sessions.add(session.session_id);
          existing.users.add(session.user_id);
          if (session.is_bounce) existing.bounces++;

          todayDeviceMap.set(deviceType, existing);
        });

        // Add today's page views
        if (todayPageViews && !todayPageViewsError) {
          todayPageViews.forEach(pv => {
            const session = todaySessions.find(s => s.session_id === pv.session_id);
            if (session) {
              const deviceType = session.device_type || 'unknown';
              const existing = todayDeviceMap.get(deviceType);
              if (existing) {
                existing.pageViews++;
              }
            }
          });
        }

        // Convert today's data and merge with stored data
        const todayDevices = Array.from(todayDeviceMap.entries()).map(([deviceType, data]) => ({
          device_type: deviceType,
          sessions_count: data.sessions.size,
          users_count: data.users.size,
          page_views_count: data.pageViews,
          bounce_rate: data.sessions.size > 0 ? Math.round((data.bounces / data.sessions.size) * 100) : 0
        }));

        console.log('📊 Today\'s calculated stats:', todayDevices);

        // Merge stored data with today's real-time data
        const deviceTotals = new Map<string, DeviceAnalytics>();

        // Add stored data
        devices.forEach(device => {
          deviceTotals.set(device.device_type, { ...device });
        });

        // Add/merge today's data
        todayDevices.forEach(todayDevice => {
          const existing = deviceTotals.get(todayDevice.device_type) || {
            device_type: todayDevice.device_type,
            sessions_count: 0,
            users_count: 0,
            page_views_count: 0,
            bounce_rate: 0
          };

          existing.sessions_count += todayDevice.sessions_count;
          existing.users_count += todayDevice.users_count;
          existing.page_views_count += todayDevice.page_views_count;
          
          // Average bounce rates (weighted by sessions)
          const totalSessions = existing.sessions_count;
          if (totalSessions > 0) {
            existing.bounce_rate = Math.round(
              (existing.bounce_rate * (totalSessions - todayDevice.sessions_count) + 
               todayDevice.bounce_rate * todayDevice.sessions_count) / totalSessions
            );
          }

          deviceTotals.set(todayDevice.device_type, existing);
        });

        devices = Array.from(deviceTotals.values());
      }
    }

    // =====================================================
    // STEP 3: If no stored data at all, calculate everything from live data
    // =====================================================
    if (!hasStoredData && devices.length === 0) {
      console.log('🔄 No stored data found, calculating everything from live sessions...');
      
      const { data: allSessions, error: allSessionsError } = await supabase
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

      const { data: allPageViews, error: allPageViewsError } = await supabase
        .from('analytics_page_views')
        .select('session_id, user_id, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      console.log('📊 Full live data calculation:', {
        sessions: allSessions?.length || 0,
        pageViews: allPageViews?.length || 0
      });

      if (allSessions && !allSessionsError) {
        const deviceMap = new Map<string, {
          sessions: Set<string>;
          users: Set<string>;
          bounces: number;
          pageViews: number;
        }>();

        // Process all sessions
        allSessions.forEach(session => {
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

        // Add all page views
        if (allPageViews && !allPageViewsError) {
          allPageViews.forEach(pv => {
            const session = allSessions.find(s => s.session_id === pv.session_id);
            if (session) {
              const deviceType = session.device_type || 'unknown';
              const existing = deviceMap.get(deviceType);
              if (existing) {
                existing.pageViews++;
              }
            }
          });
        }

        devices = Array.from(deviceMap.entries()).map(([deviceType, data]) => ({
          device_type: deviceType,
          sessions_count: data.sessions.size,
          users_count: data.users.size,
          page_views_count: data.pageViews,
          bounce_rate: data.sessions.size > 0 ? Math.round((data.bounces / data.sessions.size) * 100) : 0
        }));
      }
    }

    // Sort by sessions count (highest first)
    devices.sort((a, b) => b.sessions_count - a.sessions_count);

    console.log('🎯 Final combined device data:', devices);
    console.log('📊 Data sources used:', {
      hasStoredData,
      addedTodaysRealTime: !hasStoredData || !storedStats?.some(s => s.date === today),
      totalDeviceTypes: devices.length
    });

    return NextResponse.json({ 
      devices: devices.length > 0 ? devices : [
        { device_type: 'unknown', sessions_count: 0, users_count: 0, page_views_count: 0, bounce_rate: 0 }
      ],
      meta: {
        hasStoredData,
        realTimeIncluded: true,
        dateRange: { startDate, endDate }
      }
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