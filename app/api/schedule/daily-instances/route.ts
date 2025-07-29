// app/api/schedule/daily-instances/route.ts - Enhanced to handle moved and added businesses

// POST - Update item status, add new business, or handle moves
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { instance_id, business_id, status, moved_to_date, notes, added_reason } = body;

    if (!instance_id || !business_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: instance_id, business_id, status" },
        { status: 400 }
      );
    }

    console.log("📝 Processing clean item operation:", { instance_id, business_id, status, moved_to_date, added_reason });

    // Get current user
    let userId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch (err) {
      console.log("🔓 No user session found");
    }

    // Check if this business is already in this instance
    const { data: existingItem, error: checkError } = await supabase
      .from("daily_clean_items")
      .select("id, status, is_added, original_instance_id")
      .eq("instance_id", instance_id)
      .eq("business_id", business_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking existing item:", checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existingItem) {
      // Update existing item
      console.log("🔄 Updating existing clean item:", existingItem.id);
      
      const updateData: any = {
        status,
        marked_by: userId,
        updated_at: new Date().toISOString()
      };

      // Handle different status changes
      if (status === "cleaned") {
        updateData.cleaned_at = new Date().toISOString();
        updateData.moved_to_date = null;
      } else if (status === "moved" && moved_to_date) {
        updateData.moved_to_date = moved_to_date;
        updateData.cleaned_at = null;
        
        // Get the current instance date to set as moved_from_date
        const { data: currentInstance } = await supabase
          .from("daily_clean_instances")
          .select("instance_date")
          .eq("id", instance_id)
          .single();
        
        if (currentInstance) {
          updateData.moved_from_date = currentInstance.instance_date;
          updateData.original_instance_id = instance_id;
        }
      } else if (status === "pending") {
        updateData.cleaned_at = null;
        updateData.moved_to_date = null;
      }

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const { data: updatedItem, error: updateError } = await supabase
        .from("daily_clean_items")
        .update(updateData)
        .eq("id", existingItem.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating clean item:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      console.log("✅ Updated clean item:", updatedItem.id);
      return NextResponse.json({ success: true, item: updatedItem });

    } else {
      // Add new business to instance (on-the-fly addition)
      console.log("➕ Adding new business to instance");
      
      // Get the business details
      const { data: business, error: businessError } = await supabase
        .from("Businesses")
        .select("id, business_name, address, before_open")
        .eq("id", business_id)
        .single();

      if (businessError) {
        console.error("Error fetching business details:", businessError);
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
      }

      // Create new clean item
      const newItemData: any = {
        instance_id,
        business_id,
        business_name: business.business_name,
        address: business.address,
        before_open: business.before_open,
        status,
        marked_by: userId,
        is_added: true, // Mark as added on-the-fly
        added_reason: added_reason || 'Added during cleaning day',
        notes: notes || `Added on-the-fly: ${added_reason || 'moved from another day'}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Handle status-specific fields
      if (status === "cleaned") {
        newItemData.cleaned_at = new Date().toISOString();
      } else if (status === "moved" && moved_to_date) {
        newItemData.moved_to_date = moved_to_date;
        
        // If this is being added as already moved, get the original date
        const { data: currentInstance } = await supabase
          .from("daily_clean_instances")
          .select("instance_date")
          .eq("id", instance_id)
          .single();
        
        if (currentInstance) {
          newItemData.moved_from_date = currentInstance.instance_date;
          newItemData.original_instance_id = instance_id;
        }
      }

      const { data: newItem, error: insertError } = await supabase
        .from("daily_clean_items")
        .insert(newItemData)
        .select()
        .single();

      if (insertError) {
        console.error("Error adding business to instance:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      console.log("✅ Added new business to instance:", newItem.id);
      return NextResponse.json({ success: true, item: newItem });
    }

  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Enhanced GET method to include moved businesses
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const week = searchParams.get("week");
    const day = searchParams.get("day");

    if (!date || !week || !day) {
      return NextResponse.json(
        { error: "Missing required parameters: date, week, day" },
        { status: 400 }
      );
    }

    console.log("🔍 Fetching daily instance for:", { date, week, day });

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
          moved_from_date,
          is_added,
          added_reason,
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

    // If instance exists, also check for businesses moved to this date
    if (existingInstance) {
      console.log("📋 Found existing instance:", existingInstance.id);
      
      // Get businesses moved to this date from other days
      const { data: movedBusinesses, error: movedError } = await supabase
        .from("daily_clean_items")
        .select(`
          *,
          daily_clean_instances!inner (
            instance_date,
            day_name
          )
        `)
        .eq("moved_to_date", date)
        .eq("status", "moved")
        .neq("instance_id", existingInstance.id); // Exclude businesses from current instance

      let allItems = existingInstance.daily_clean_items || [];

      // Add moved businesses as new pending items
      if (movedBusinesses && movedBusinesses.length > 0) {
        console.log("📦 Found", movedBusinesses.length, "businesses moved to this date");
        
        for (const movedBusiness of movedBusinesses) {
          // Check if this business is already in today's instance
          const alreadyExists = allItems.some(item => item.business_id === movedBusiness.business_id);
          
          if (!alreadyExists) {
            // Add as a new pending item
            const movedItem = {
              id: `moved_${movedBusiness.id}`, // Temporary ID for frontend
              business_id: movedBusiness.business_id,
              business_name: movedBusiness.business_name,
              address: movedBusiness.address,
              before_open: movedBusiness.before_open,
              status: "pending", // Reset to pending for the new day
              cleaned_at: null,
              moved_to_date: null,
              moved_from_date: movedBusiness.daily_clean_instances.instance_date,
              is_added: true,
              added_reason: `Moved from ${movedBusiness.daily_clean_instances.day_name}`,
              notes: `Moved from ${movedBusiness.daily_clean_instances.day_name} (${movedBusiness.daily_clean_instances.instance_date})`,
              marked_by: null,
              updated_at: new Date().toISOString()
            };
            
            allItems.push(movedItem);
          }
        }
      }

      return NextResponse.json({
        instance: existingInstance,
        items: allItems
      });
    }

    // If no instance exists, create a new one (rest of the existing logic)
    console.log("🆕 Creating new instance for", date, week, day);
    
    let userId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch (err) {
      console.log("🔓 No session found – proceeding anonymously");
    }

    // Create new instance
    const { data: newInstance, error: createError } = await supabase
      .from("daily_clean_instances")
      .insert([{
        instance_date: date,
        week_number: parseInt(week),
        day_name: day.toLowerCase(),
        status: "active",
        created_by: userId
      }])
      .select()
      .single();

    if (createError) {
      console.error("Error creating instance:", createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    console.log("✅ Created new instance:", newInstance.id);

    // Populate with scheduled businesses + moved businesses
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

    let allItems = [];

    // Add scheduled businesses
    if (scheduledBusinesses && scheduledBusinesses.length > 0) {
      const cleanItems = scheduledBusinesses.map((entry: any) => ({
        instance_id: newInstance.id,
        business_id: entry.business_id,
        business_name: entry.Businesses.business_name,
        address: entry.Businesses.address,
        before_open: entry.Businesses.before_open,
        status: "pending",
        is_added: false
      }));

      const { data: items, error: itemsError } = await supabase
        .from("daily_clean_items")
        .insert(cleanItems)
        .select();

      if (itemsError) {
        console.error("Error creating clean items:", itemsError);
        return NextResponse.json({ error: itemsError.message }, { status: 500 });
      }

      allItems = items || [];
      console.log("✅ Created", items?.length || 0, "scheduled clean items");
    }

    // Also check for businesses moved to this date
    const { data: movedBusinesses, error: movedError } = await supabase
      .from("daily_clean_items")
      .select(`
        *,
        daily_clean_instances!inner (
          instance_date,
          day_name
        )
      `)
      .eq("moved_to_date", date)
      .eq("status", "moved");

    if (movedBusinesses && movedBusinesses.length > 0) {
      console.log("📦 Found", movedBusinesses.length, "businesses moved to this date");
      
      for (const movedBusiness of movedBusinesses) {
        // Check if this business is already scheduled
        const alreadyScheduled = allItems.some(item => item.business_id === movedBusiness.business_id);
        
        if (!alreadyScheduled) {
          // Add as a new item to the instance
          const movedItemData = {
            instance_id: newInstance.id,
            business_id: movedBusiness.business_id,
            business_name: movedBusiness.business_name,
            address: movedBusiness.address,
            before_open: movedBusiness.before_open,
            status: "pending",
            is_added: true,
            added_reason: `Moved from ${movedBusiness.daily_clean_instances.day_name}`,
            notes: `Moved from ${movedBusiness.daily_clean_instances.day_name} (${movedBusiness.daily_clean_instances.instance_date})`,
            moved_from_date: movedBusiness.daily_clean_instances.instance_date
          };

          const { data: newMovedItem, error: movedItemError } = await supabase
            .from("daily_clean_items")
            .insert(movedItemData)
            .select()
            .single();

          if (!movedItemError && newMovedItem) {
            allItems.push(newMovedItem);
          }
        }
      }
    }

    return NextResponse.json({
      instance: newInstance,
      items: allItems
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}