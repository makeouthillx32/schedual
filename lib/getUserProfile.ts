// /lib/getUserProfile.ts
"use server";

import { createClient } from "@/utils/supabase/server";

export async function getUserProfile() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error.message);
    return null;
  }

  return profile;
}


// // /app/profile/page.tsx
// import { getUserProfile } from "@/lib/getUserProfile";
// import ProfileCard from "@/components/profile/ProfileCard";

// export default async function ProfilePage() {
//   const profile = await getUserProfile();

//   if (!profile) {
//     return <p className="text-center p-10">Not logged in.</p>;
//   }

//   return (
//     <div className="p-10 max-w-4xl mx-auto">
//       <ProfileCard profile={profile} />
//     </div>
//   );
// }


// // /components/profile/ProfileCard.tsx
// "use client";

// interface ProfileProps {
//   profile: {
//     id: string;
//     full_name: string;
//     role: string;
//   };
// }

// export default function ProfileCard({ profile }: ProfileProps) {
//   return (
//     <div className="border rounded-lg p-6 shadow bg-white dark:bg-zinc-900">
//       <h2 className="text-xl font-bold mb-2">Profile Info</h2>
//       <p><strong>Name:</strong> {profile.full_name || "Not set"}</p>
//       <p><strong>Role:</strong> {profile.role}</p>
//     </div>
//   );
// }

