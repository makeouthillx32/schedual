// Example POST handler for the same route
import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ChannelRouteContext, PostRouteHandler } from "@/types/api";

// POST handler for creating a new message
export const POST: PostRouteHandler<{ channel_id: string }> = async (
  req: NextRequest,
  context: ChannelRouteContext
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