// app/api/pages/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import supabase from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('slug', { ascending: true });

  if (error) {
    console.error('Supabase error fetching pages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
