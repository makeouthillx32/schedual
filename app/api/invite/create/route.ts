import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const { role } = await req.json();
  const supabase = createServerActionClient({ cookies });

  const code = randomUUID();

  const { error } = await supabase.from("invites").insert([
    { code, role }
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/sign-up?invite=${code}`;
  return NextResponse.json({ inviteLink: url });
}