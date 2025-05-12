// app/api/messages/[channel_id]/route.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

type Context = {
  params: {
    channel_id: string;
  };
};

export async function GET(_req: Request, context: Context) {
  const { channel_id } = context.params;

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("get_channel_messages", {
    p_channel_id: channel_id,
    p_user_id: user.id,
    p_limit: 50,
    p_before_id: null,
  });

  if (error) {
    console.error("Supabase RPC error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const messages = (data ?? []).map((row: any) => ({
    id: row.message_id,
    content: row.content,
    timestamp: row.created_at,
    sender: {
      id: row.sender_id,
      name: row.sender_name,
      email: row.sender_email,
      avatar: row.sender_avatar_url,
    },
    isEdited: row.is_edited,
    reactions: row.reactions,
    attachments: row.attachments,
  }));

  return NextResponse.json(messages);
}