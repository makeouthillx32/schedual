import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Create a direct Supabase client with service role key
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Test if the function exists
    const { data: functionExists } = await supabase.rpc("get_user_conversations", {
      p_user_id: "6db3a2c3-08c2-4426-a408-63895f4324c1", // my user id
      p_limit: 1,
    })

    // If we get here without error, the function exists but might return empty results
    return NextResponse.json({
      success: true,
      message: "Function exists and can be called",
      data: functionExists,
    })
  } catch (error: any) {
    console.error("Function test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: "Error testing the function",
      },
      { status: 500 },
    )
  }
}
