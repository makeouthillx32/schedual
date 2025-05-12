// app/api/messages/[channel_id]/route.ts
import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ChannelParams, GetRouteHandler } from "@/types/api";

// Use the proper type for GET handler
export const GET: GetRouteHandler<ChannelParams> = async (
  req: NextRequest,
  context: ChannelParams
) => {
  const { channel_id } = context.params;
  const supabase = await createClient();

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
};
// Example POST handler for the same route

import {  PostRouteHandler } from "@/types/api";

// POST handler for creating a new message
export const POST: PostRouteHandler<ChannelParams> = async (
  req: NextRequest,
  context: ChannelParams
) => {
  const { channel_id } = context.params;
  const supabase = await createClient();

  // Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse request body
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { content, attachments = [] } = body;

  if (!content && attachments.length === 0) {
    return NextResponse.json(
      { error: "Message must have content or attachments" },
      { status: 400 }
    );
  }

  // Insert message
  const { data, error } = await supabase
    .from("messages")
    .insert({
      channel_id,
      sender_id: user.id,
      content,
      attachments: attachments.length > 0 ? attachments : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
};