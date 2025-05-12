import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET() {
  try {
    const cookieStore = cookies()

    // Log environment variables (without revealing full values)
    console.log("NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Check if user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("Authentication error:", userError.message)
      return NextResponse.json({ error: "Authentication failed", details: userError.message }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    console.log("User authenticated:", user.id)

    // Call the RPC function with detailed error logging
    const { data, error } = await supabase.rpc("get_user_conversations", {
      p_user_id: user.id,
    })

    if (error) {
      console.error("RPC error details:", {
        message: error.message,
        hint: error.hint,
        details: error.details,
        code: error.code,
      })
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }

    if (!data) {
      console.log("No data returned (null or undefined)")
      return NextResponse.json([]) // Return empty array instead of error
    }

    if (!Array.isArray(data)) {
      console.error("Invalid data returned (not an array):", typeof data)
      return NextResponse.json({ error: "Invalid data format returned from database" }, { status: 500 })
    }

    console.log(`Successfully retrieved ${data.length} conversations`)

    // Transform data to match the expected format in the frontend
    const transformedData = data.map((conversation) => ({
      channel_id: conversation.channel_id,
      channel_name: conversation.channel_name,
      is_group: conversation.is_group,
      last_message: conversation.last_message_content,
      last_message_at: conversation.last_message_at,
      unread_count: conversation.unread_count,
      participants: conversation.participants,
    }))

    return NextResponse.json(transformedData)
  } catch (error: any) {
    console.error("Unexpected error in get-conversations API:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
