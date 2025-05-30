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
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipod') || ua.includes('blackberry') || ua.includes('windows phone')) {
    return 'mobile';
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider') || ua.includes('scraper')) {
    return 'bot';
  }
  
  return 'desktop';
}

function extractBrowser(userAgent: string): string {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('chrome') && !ua.includes('edge') && !ua.includes('edg')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edge') || ua.includes('edg')) return 'Edge';
  if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
  
  return 'unknown';
}

function extractOS(userAgent: string): string {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'macOS';
  if (ua.includes('linux') && !ua.includes('android')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'iOS';
  
  return 'unknown';
}

function detectBot(userAgent: string): boolean {
  if (!userAgent) return false;
  
  const ua = userAgent.toLowerCase();
  const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'fetch', 'curl', 'wget', 'slurp'];
  
  return botPatterns.some(pattern => ua.includes(pattern));
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const payload: TrackingPayload = await request.json();
    
    // Validate required fields
    if (!payload.sessionId || !payload.pageUrl || !payload.userAgent) {
      return NextResponse.json({ 
        error: 'Missing required fields: sessionId, pageUrl, userAgent' 
      }, { status: 400 });
    }
    
    // Get client IP address
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     request.headers.get('x-real-ip') || 
                     request.ip ||
                     '127.0.0.1';
    
    // Extract device and browser information
    const deviceType = detectDeviceType(payload.userAgent);
    const browser = extractBrowser(payload.userAgent);
    const os = extractOS(payload.userAgent);
    const isBot = detectBot(payload.userAgent);
    
    // First, find or create the user
    let userId: string;
    
    // Check if user exists by session_id
    const { data: existingUser, error: userSelectError } = await supabase
      .from('analytics_users')
      .select('id')
      .eq('session_id', payload.sessionId)
      .maybeSingle();
    
    if (userSelectError) {
      console.error('Error selecting user:', userSelectError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    if (existingUser) {
      userId = existingUser.id;
      
      // Update user's last_seen and other info
      const { error: updateError } = await supabase
        .from('analytics_users')
        .update({
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          screen_width: payload.screenWidth || null,
          screen_height: payload.screenHeight || null,
          language: payload.language || null,
          timezone: payload.timezone || null,
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating user:', updateError);
      }
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
          screen_width: payload.screenWidth || null,
          screen_height: payload.screenHeight || null,
          language: payload.language || null,
          timezone: payload.timezone || null,
        })
        .select('id')
        .single();
      
      if (userError) {
        console.error('Error creating user:', userError);
        return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
      }
      
      userId = newUser.id;
    }
    
    // Create or update session
    const { data: existingSession, error: sessionSelectError } = await supabase
      .from('analytics_sessions')
      .select('id, entry_page')
      .eq('session_id', payload.sessionId)
      .maybeSingle();
    
    if (sessionSelectError) {
      console.error('Error selecting session:', sessionSelectError);
    }
    
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
          referrer: payload.referrer || null,
          utm_source: payload.utmParams?.source || null,
          utm_medium: payload.utmParams?.medium || null,
          utm_campaign: payload.utmParams?.campaign || null,
        });
      
      if (sessionError) {
        console.error('Error creating session:', sessionError);
        // Don't fail the request, sessions are updated via triggers
      }
    } else {
      // Update existing session end time and exit page
      const { error: updateError } = await supabase
        .from('analytics_sessions')
        .update({
          end_time: new Date().toISOString(),
          exit_page: payload.pageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', payload.sessionId);
      
      if (updateError) {
        console.error('Error updating session:', updateError);
      }
    }
    
    // Create page view record
    const { error: pageViewError } = await supabase
      .from('analytics_page_views')
      .insert({
        user_id: userId,
        session_id: payload.sessionId,
        page_url: payload.pageUrl,
        page_title: payload.pageTitle || null,
        referrer: payload.referrer || null,
        utm_source: payload.utmParams?.source || null,
        utm_medium: payload.utmParams?.medium || null,
        utm_campaign: payload.utmParams?.campaign || null,
        utm_term: payload.utmParams?.term || null,
        utm_content: payload.utmParams?.content || null,
        load_time: payload.loadTime || null,
      });
    
    if (pageViewError) {
      console.error('Error creating page view:', pageViewError);
      return NextResponse.json({ error: 'Failed to track page view' }, { status: 500 });
    }
    
    // Return success
    return NextResponse.json({ 
      success: true, 
      userId,
      deviceType,
      browser,
      os
    });
    
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Analytics tracking endpoint is active',
    endpoints: {
      POST: 'Track page views and sessions',
    }
  });
}