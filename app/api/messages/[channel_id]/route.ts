// app/api/messages/[channel_id]/route.ts
import { type NextRequest } from "next/server";
import { createServerClient } from "@/utils/supabase";
import { NextResponse } from "next/server";
import { ChannelParams, GetRouteHandler, PostRouteHandler } from "@/types/api";
import { z } from "zod"; // If you have zod installed for validation

// Message input schema for POST request (optional, for validation)
const MessageSchema = z.object({
  content: z.string().optional(),
  attachments: z.array(z.any()).optional().default([])
}).refine(data => 
  (data.content && data.content.trim().length > 0) || 
  (data.attachments && data.attachments.length > 0), 
  { message: "Message must have content or attachments" }
);

// GET handler for fetching messages
export const GET: GetRouteHandler<ChannelParams> = async (
  req: NextRequest,
  context: ChannelParams
) => {
  const { channel_id } = context.params;
  
  try {
    // Create the server client
    const supabase = await createServerClient();

    // Authenticate the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pagination parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const before_id = url.searchParams.get("before_id");

    // Fetch messages using RPC
    const { data, error } = await supabase.rpc("get_channel_messages", {
      p_channel_id: channel_id,
      p_user_id: user.id,
      p_limit: limit,
      p_before_id: before_id,
    });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform messages for the client
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
      reactions: row.reactions || [],
      attachments: row.attachments || [],
    }));

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
};

// POST handler for creating messages
export const POST: PostRouteHandler<ChannelParams> = async (
  req: NextRequest,
  context: ChannelParams
) => {
  const { channel_id } = context.params;
  
  try {
    // Create the server client
    const supabase = await createServerClient();

    // Authenticate the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
      // If you have zod, uncomment this:
      // body = MessageSchema.parse(body);
    } catch (e) {
      return NextResponse.json({ 
        error: e instanceof z.ZodError 
          ? "Invalid message format" 
          : "Invalid request body" 
      }, { status: 400 });
    }

    const { content, attachments = [] } = body;

    // Basic validation without zod
    if (!content && attachments.length === 0) {
      return NextResponse.json(
        { error: "Message must have content or attachments" },
        { status: 400 }
      );
    }

    // Insert the message
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
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
};