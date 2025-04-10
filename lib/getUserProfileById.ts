// lib/getUserProfileById.ts
"use server";

import { createClient } from "@/utils/supabase/server";

export async function getUserProfileById(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile by ID:", error.message);
    return null;
  }

  return data;
}
