// app/api/nav_items/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import supabase from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  const { data, error } = await supabase
    .from('nav_items')
    .select('id, label, page_slug, parent_id, sort_order')
    .order('parent_id', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Supabase error fetching nav_items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
