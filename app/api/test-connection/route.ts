import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Create a direct Supabase client (not using cookies)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Test a simple query
    const { data, error } = await supabase.from("channels").select("id, name").limit(1)

    if (error) {
      console.error("Database connection error:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: "Database connection failed",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      data: data,
    })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: "Unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
