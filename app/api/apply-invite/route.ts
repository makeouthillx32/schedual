// app/api/apply-invite/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { invite } = await req.json();
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No authenticated user" }, { status: 401 });
  }

  // Find invite
  const { data: inviteData, error: inviteError } = await supabase
    .from('invites')
    .select('role_id')
    .eq('code', invite)
    .single();

  if (inviteError || !inviteData) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 400 });
  }

  // Find role name
  const { data: roleData } = await supabase
    .from('roles')
    .select('role')
    .eq('id', inviteData.role_id)
    .single();

  if (!roleData) {
    return NextResponse.json({ error: "Role not found" }, { status: 400 });
  }

  // Update user's profile
  await supabase
    .from('profiles')
    .update({ role: roleData.role })
    .eq('id', user.id);

  // Optionally delete the invite
  await supabase
    .from('invites')
    .delete()
    .eq('code', invite);

  return NextResponse.json({ success: true });
}