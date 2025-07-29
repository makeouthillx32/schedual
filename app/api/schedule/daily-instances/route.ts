// app/api/schedule/daily-instances/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Fetch or create today's instance
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date"); // YYYY-MM-DD format
  const week = searchParams.get("week");
  const day = searchParams.get("day");

  if (!date || !week || !day) {
    return NextResponse.json(
      { error: "Missing required parameters: date, week, day" },
      { status: 400 }
    );
  }

  try {
    // First, try to find existing instance
    const { data: existingInstance, error: fetchError } = await supabase
      .from("daily_clean_instances")
      .select(`
        *,
        daily_clean_items (
          id,
          business_id,
          business_name,
          address,
          before_open,
          status,
          cleaned_at,
          moved_to_date,
          notes,
          marked_by,
          updated_at
        )
      `)
      .eq("instance_date", date)
      .eq("week_number", parseInt(week))
      .eq("day_name", day.toLowerCase())
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching instance:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // If instance exists, return it
    if (existingInstance) {
      console.log("📋 Found existing instance:", existingInstance.id);
      return NextResponse.json({
        instance: existingInstance,
        items: existingInstance.daily_clean_items || []
      });
    }

    // If no instance exists, create a new one
    console.log("🆕 Creating new instance for", date, week, day);
    
    // Get current user (optional for now)
    const { data: { user } } = await supabase.auth.getUser();

    // Create new instance
    const { data: newInstance, error: createError } = await supabase
      .from("daily_clean_instances")
      .insert([{
        instance_date: date,
        week_number: parseInt(week),
        day_name: day.toLowerCase(),
        status: "active",
        created_by: user?.id || null
      }])
      .select()
      .single();

    if (createError) {
      console.error("Error creating instance:", createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    console.log("✅ Created new instance:", newInstance.id);

    // Now populate it with today's scheduled businesses
    // Fetch scheduled businesses for this day/week
    const { data: scheduledBusinesses, error: scheduleError } = await supabase
      .from("Schedule")
      .select(`
        business_id,
        Businesses!inner(id, business_name, address, before_open)
      `)
      .eq(day.toLowerCase(), true)
      .eq("week", parseInt(week));

    if (scheduleError) {
      console.error("Error fetching scheduled businesses:", scheduleError);
      return NextResponse.json({ error: scheduleError.message }, { status: 500 });
    }

    // Create clean items for each scheduled business
    if (scheduledBusinesses && scheduledBusinesses.length > 0) {
      const cleanItems = scheduledBusinesses.map((entry: any) => ({
        instance_id: newInstance.id,
        business_id: entry.business_id,
        business_name: entry.Businesses.business_name,
        address: entry.Businesses.address,
        before_open: entry.Businesses.before_open,
        status: "pending"
      }));

      const { data: items, error: itemsError } = await supabase
        .from("daily_clean_items")
        .insert(cleanItems)
        .select();

      if (itemsError) {
        console.error("Error creating clean items:", itemsError);
        return NextResponse.json({ error: itemsError.message }, { status: 500 });
      }

      console.log("✅ Created", items.length, "clean items");

      return NextResponse.json({
        instance: newInstance,
        items: items || []
      });
    }

    // No businesses scheduled for today
    return NextResponse.json({
      instance: newInstance,
      items: []
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Update item status in instance
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { instance_id, business_id, status, moved_to_date, notes } = body;

    if (!instance_id || !business_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: instance_id, business_id, status" },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Prepare update data
    const updateData: any = {
      status,
      marked_by: user?.id || null,
      updated_at: new Date().toISOString()
    };

    if (status === "cleaned") {
      updateData.cleaned_at = new Date().toISOString();
      updateData.moved_to_date = null; // Clear moved date if it was previously set
    } else if (status === "moved" && moved_to_date) {
      updateData.moved_to_date = moved_to_date;
      updateData.cleaned_at = null; // Clear cleaned time if it was previously set
    } else if (status === "pending") {
      updateData.cleaned_at = null;
      updateData.moved_to_date = null;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update the item
    const { data, error } = await supabase
      .from("daily_clean_items")
      .update(updateData)
      .eq("instance_id", instance_id)
      .eq("business_id", business_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating clean item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Updated clean item:", data.id, "to status:", status);

    return NextResponse.json({ success: true, item: data });

  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update instance status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { instance_id, status } = body;

    if (!instance_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: instance_id, status" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("daily_clean_instances")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", instance_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating instance:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Updated instance:", instance_id, "to status:", status);

    return NextResponse.json({ success: true, instance: data });

  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}