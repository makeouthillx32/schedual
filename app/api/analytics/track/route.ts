// app/api/analytics/track/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface TrackingPayload {
  pageUrl: string;
  pageTitle?: string;
  referrer?: string;
  userAgent: string;
  sessionId: string;
  screenWidth?: number;
  screenHeight?: number;
  language?: string;
  timezone?: string;
  loadTime?: number;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

// Helper functions for user agent parsing
function detectDeviceType(userAgent: string): string {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipod')) {
    return 'mobile';
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) {
    return 'bot';
  }
  
  return 'desktop';
}

function extractBrowser(userAgent: string): string {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('chrome') && !ua.includes('edge')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';
  if (ua.includes('opera')) return 'Opera';
  
  return 'unknown';
}

function extractOS(userAgent: string): string {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'iOS';
  
  return 'unknown';
}

function detectBot(userAgent: string): boolean {
  if (!userAgent) return false;
  
  const ua = userAgent.toLowerCase();
  const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'fetch', 'curl'];
  
  return botPatterns.some(pattern => ua.includes(pattern));
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const payload: TrackingPayload = await request.json();
    
    // Get client IP address
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    
    // Extract device and browser information
    const deviceType = detectDeviceType(payload.userAgent);
    const browser = extractBrowser(payload.userAgent);
    const os = extractOS(payload.userAgent);
    const isBot = detectBot(payload.userAgent);
    
    // First, find or create the user
    let userId: string;
    
    // Check if user exists by session_id
    const { data: existingUser } = await supabase
      .from('analytics_users')
      .select('id')
      .eq('session_id', payload.sessionId)
      .single();
    
    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: userError } = await supabase
        .from('analytics_users')
        .insert({
          user_agent: payload.userAgent,
          ip_address: clientIP,
          session_id: payload.sessionId,
          device_type: deviceType,
          browser: browser,
          os: os,
          is_bot: isBot,
          screen_width: payload.screenWidth,
          screen_height: payload.screenHeight,
          language: payload.language,
          timezone: payload.timezone,
        })
        .select('id')
        .single();
      
      if (userError) {
        console.error('Error creating user:', userError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      
      userId = newUser.id;
    }
    
    // Create or update session
    const { data: existingSession } = await supabase
      .from('analytics_sessions')
      .select('id')
      .eq('session_id', payload.sessionId)
      .single();
    
    if (!existingSession) {
      // Create new session
      const { error: sessionError } = await supabase
        .from('analytics_sessions')
        .insert({
          session_id: payload.sessionId,
          user_id: userId,
          entry_page: payload.pageUrl,
          device_type: deviceType,
          browser: browser,
          os: os,
          referrer: payload.referrer,
          utm_source: payload.utmParams?.source,
          utm_medium: payload.utmParams?.medium,
          utm_campaign: payload.utmParams?.campaign,
        });
      
      if (sessionError) {
        console.error('Error creating session:', sessionError);
        // Don't fail the request, just log the error
      }
    } else {
      // Update existing session end time
      const { error: updateError } = await supabase
        .from('analytics_sessions')
        .update({
          end_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', payload.sessionId);
      
      if (updateError) {
        console.error('Error updating session:', updateError);
        // Don't fail the request
      }
    }
    
    // Create page view record
    const { error: pageViewError } = await supabase
      .from('analytics_page_views')
      .insert({
        user_id: userId,
        session_id: payload.sessionId,
        page_url: payload.pageUrl,
        page_title: payload.pageTitle,
        referrer: payload.referrer,
        utm_source: payload.utmParams?.source,
        utm_medium: payload.utmParams?.medium,
        utm_campaign: payload.utmParams?.campaign,
        utm_term: payload.utmParams?.term,
        utm_content: payload.utmParams?.content,
        load_time: payload.loadTime,
      });
    
    if (pageViewError) {
      console.error('Error creating page view:', pageViewError);
      return NextResponse.json({ error: 'Failed to track page view' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, userId });
    
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}