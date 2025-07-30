// app/api/public/assets/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Cache headers for different asset types
const getCacheHeaders = (mimeType?: string) => {
  const headers: Record<string, string> = {
    'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
    'Access-Control-Allow-Origin': '*', // Allow CORS for all origins
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  };

  if (mimeType) {
    headers['Content-Type'] = mimeType;
  }

  return headers;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const supabase = await createClient("service");
    const assetPath = params.path.join('/');
    
    // Only serve from designated public folders
    const allowedPaths = [
      'company-assets/',
      'public-images/',
      'marketing/',
      'logos/',
      'brand-assets/'
    ];
    
    const isAllowedPath = allowedPaths.some(allowed => 
      assetPath.startsWith(allowed)
    );
    
    if (!isAllowedPath) {
      return NextResponse.json(
        { error: 'Asset not found or not publicly accessible' },
        { status: 404 }
      );
    }

    // Get document info from database first
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, name, mime_type, size_bytes, path, is_public')
      .eq('path', assetPath)
      .eq('is_public', true) // Only serve public assets
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Get the actual file from storage
    const { data: fileData, error: storageError } = await supabase.storage
      .from('documents')
      .download(assetPath);

    if (storageError || !fileData) {
      return NextResponse.json(
        { error: 'Failed to retrieve asset' },
        { status: 500 }
      );
    }

    // Convert to buffer
    const buffer = await fileData.arrayBuffer();
    
    return new NextResponse(buffer, {
      status: 200,
      headers: getCacheHeaders(document.mime_type)
    });

  } catch (error) {
    console.error('Public asset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Same logic as GET but only return headers
  const getResponse = await GET(request, { params });
  return new NextResponse(null, {
    status: getResponse.status,
    headers: getResponse.headers
  });
}