// app/api/analytics/devices/route.ts - FIXED TO INCLUDE BROWSER/OS FROM AGGREGATED DATA
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface DeviceAnalytics {
  device_type: string;
  browser: string;
  os: string;
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

    console.log('🔍 [API] Fetching detailed device stats with browser/OS');

    // =====================================================
    // STEP 1: Get ALL device stats with browser/OS details
    // =====================================================
    const { data: storedStats, error: storedError } = await supabase
      .from('analytics_device_stats')
      .select('device_type, browser, os, sessions_count, users_count, page_views_count, bounce_rate, date')
      .gte('date', startDate.split('T')[0])
      .lte('date', endDate.split('T')[0]);

    let devices: DeviceAnalytics[] = [];

    if (storedStats && storedStats.length > 0) {
      console.log('✅ [API] Found aggregated data:', storedStats.length, 'records');
      console.log('📊 [API] Sample record:', storedStats[0]);
      
      // Keep all the detailed records (don't group by device_type only)
      devices = storedStats.map(stat => ({
        device_type: stat.device_type,
        browser: stat.browser || 'Unknown',
        os: stat.os || 'Unknown',
        sessions_count: stat.sessions_count || 0,
        users_count: stat.users_count || 0,
        page_views_count: stat.page_views_count || 0,
        bounce_rate: stat.bounce_rate || 0
      }));

    } else {
      console.log('📊 [API] No aggregated data, falling back to live sessions...');
      
      // =====================================================
      // STEP 2: Fallback to live data if no aggregated data
      // =====================================================
      const { data: sessions, error: sessionsError } = await supabase
        .from('analytics_sessions')
        .select(`
          device_type, 
          browser,
          os,
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

      console.log('📱 [API] Live data fallback:', {
        sessions: sessions?.length || 0,
        pageViews: pageViews?.length || 0
      });

      if (sessions && !sessionsError) {
        // Group by device_type, browser, and os combination
        const deviceMap = new Map<string, {
          device_type: string;
          browser: string;
          os: string;
          sessions: Set<string>;
          users: Set<string>;
          bounces: number;
          pageViews: number;
        }>();

        sessions.forEach(session => {
          const deviceType = session.device_type || 'unknown';
          const browser = session.browser || 'Unknown';
          const os = session.os || 'Unknown';
          
          const key = `${deviceType}|${browser}|${os}`;
          
          const existing = deviceMap.get(key) || {
            device_type: deviceType,
            browser: browser,
            os: os,
            sessions: new Set(),
            users: new Set(),
            bounces: 0,
            pageViews: 0
          };

          existing.sessions.add(session.session_id);
          existing.users.add(session.user_id);
          if (session.is_bounce) existing.bounces++;

          deviceMap.set(key, existing);
        });

        // Add page view counts
        if (pageViews && !pageViewsError) {
          pageViews.forEach(pv => {
            const session = sessions.find(s => s.session_id === pv.session_id);
            if (session) {
              const deviceType = session.device_type || 'unknown';
              const browser = session.browser || 'Unknown';
              const os = session.os || 'Unknown';
              const key = `${deviceType}|${browser}|${os}`;
              
              const existing = deviceMap.get(key);
              if (existing) {
                existing.pageViews++;
              }
            }
          });
        }

        // Convert to response format
        devices = Array.from(deviceMap.values()).map(data => ({
          device_type: data.device_type,
          browser: data.browser,
          os: data.os,
          sessions_count: data.sessions.size,
          users_count: data.users.size,
          page_views_count: data.pageViews,
          bounce_rate: data.sessions.size > 0 ? Math.round((data.bounces / data.sessions.size) * 100) : 0
        }));
      }
    }

    // =====================================================
    // STEP 3: Always add today's real-time data
    // =====================================================
    const today = new Date().toISOString().split('T')[0];
    const todayStart = today + 'T00:00:00.000Z';
    const todayEnd = new Date().toISOString();

    // Check if we have today's aggregated data
    const hasTodaysData = storedStats?.some(stat => stat.date === today);

    if (!hasTodaysData) {
      console.log('📊 [API] Adding today\'s real-time data...');
      
      const { data: todaySessions } = await supabase
        .from('analytics_sessions')
        .select('device_type, browser, os, user_id, is_bounce, session_id')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      if (todaySessions && todaySessions.length > 0) {
        const todayMap = new Map<string, {
          device_type: string;
          browser: string;
          os: string;
          sessions: Set<string>;
          users: Set<string>;
          bounces: number;
        }>();

        todaySessions.forEach(session => {
          const deviceType = session.device_type || 'unknown';
          const browser = session.browser || 'Unknown';
          const os = session.os || 'Unknown';
          const key = `${deviceType}|${browser}|${os}`;
          
          const existing = todayMap.get(key) || {
            device_type: deviceType,
            browser: browser,
            os: os,
            sessions: new Set(),
            users: new Set(),
            bounces: 0
          };

          existing.sessions.add(session.session_id);
          existing.users.add(session.user_id);
          if (session.is_bounce) existing.bounces++;

          todayMap.set(key, existing);
        });

        // Add today's data to existing devices or create new entries
        const deviceMap = new Map<string, DeviceAnalytics>();
        
        // Add existing devices
        devices.forEach(device => {
          const key = `${device.device_type}|${device.browser}|${device.os}`;
          deviceMap.set(key, { ...device });
        });

        // Add/merge today's data
        Array.from(todayMap.values()).forEach(todayDevice => {
          const key = `${todayDevice.device_type}|${todayDevice.browser}|${todayDevice.os}`;
          const existing = deviceMap.get(key);
          
          if (existing) {
            existing.sessions_count += todayDevice.sessions.size;
            existing.users_count += todayDevice.users.size;
            // Recalculate bounce rate
            existing.bounce_rate = Math.round(
              ((existing.bounce_rate * (existing.sessions_count - todayDevice.sessions.size)) + 
               (todayDevice.bounces / todayDevice.sessions.size * 100) * todayDevice.sessions.size) / 
              existing.sessions_count
            );
          } else {
            deviceMap.set(key, {
              device_type: todayDevice.device_type,
              browser: todayDevice.browser,
              os: todayDevice.os,
              sessions_count: todayDevice.sessions.size,
              users_count: todayDevice.users.size,
              page_views_count: 0, // Would need page views calculation
              bounce_rate: todayDevice.sessions.size > 0 ? Math.round((todayDevice.bounces / todayDevice.sessions.size) * 100) : 0
            });
          }
        });

        devices = Array.from(deviceMap.values());
      }
    }

    // Sort by sessions count (highest first)
    devices.sort((a, b) => b.sessions_count - a.sessions_count);

    console.log('🎯 [API] Final detailed device data:', devices);
    console.log('📊 [API] Sample with browser/OS:', devices[0]);

    return NextResponse.json({ 
      devices: devices.length > 0 ? devices : [
        { device_type: 'unknown', browser: 'Unknown', os: 'Unknown', sessions_count: 0, users_count: 0, page_views_count: 0, bounce_rate: 0 }
      ],
      meta: {
        hasDetailedData: devices.some(d => d.browser && d.browser !== 'Unknown'),
        totalCombinations: devices.length,
        totalSessions: devices.reduce((sum, d) => sum + d.sessions_count, 0),
        dateRange: { startDate, endDate }
      }
    });

  } catch (error) {
    console.error('Device analytics API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      devices: []
    }, { status: 500 });
  }
}