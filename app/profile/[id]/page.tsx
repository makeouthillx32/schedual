import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  UserCircle2,
  Mail,
  ShieldCheck,
  CalendarClock,
  LogIn,
  Users,
  Image,
  BadgeCheck,
  KeyRound,
  Globe,
} from "lucide-react";
import type { Metadata } from "next";

// Generate metadata for the profile page (used in head tags)
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "User Profile",
  };
}

// Define the expected props including both direct and Promise resolution
interface PageProps {
  params: { id: string } | Promise<{ id: string }>;
}

// Main server component for the user profile page
export default async function ProfilePage(props: PageProps) {
  let { params } = props;

  // Handle cases where params might be returned as a Promise
  if (typeof params.then === "function") {
    params = await params;
  }

  // Determine the base URL to use for API calls
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";

  // Convert cookies to string for request header
  const cookieHeader = cookies().toString();

  // Fetch current user's profile from custom API route
  const res = await fetch(`${baseUrl}/api/profile`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
    },
  });

  const profile = await res.json();

  // Handle failed request or no profile found
  if (!res.ok || !profile) {
    return <div className="text-center py-10 text-red-600">User not found or unauthorized.</div>;
  }

  // Redirect to the correct profile route if URL param doesn't match signed-in user
  if (profile.id !== params.id) {
    return redirect(`/profile/${profile.id}`);
  }

  // Render profile UI
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col items-center space-y-8">
        {/* User Avatar + Badge */}
        <div className="relative">
          <UserCircle2 className="h-32 w-32 text-gray-300 dark:text-gray-700" />
          {profile.role && (
            <BadgeCheck className="absolute bottom-0 right-0 h-6 w-6 text-green-500 bg-white rounded-full p-1" />
          )}
        </div>

        {/* Main heading and role */}
        <h1 className="text-4xl font-extrabold text-center dark:text-white">{profile.email}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{profile.role || "User"}</p>

        {/* Profile details cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-10">
          <ProfileCard label="User ID" value={profile.id} icon={<Users />} />
          <ProfileCard label="Email" value={profile.email} icon={<Mail />} />
          <ProfileCard label="Role" value={profile.role || "N/A"} icon={<ShieldCheck />} />
          <ProfileCard label="Email Confirmed" value={profile.email_confirmed_at ? "Yes" : "No"} icon={<KeyRound />} />
          <ProfileCard label="Created At" value={new Date(profile.created_at).toLocaleString()} icon={<CalendarClock />} />
          <ProfileCard label="Last Signed In" value={new Date(profile.last_sign_in_at).toLocaleString()} icon={<LogIn />} />
          <ProfileCard
            label="Auth Providers"
            value={profile.app_metadata?.providers?.join(", ") || "Unknown"}
            icon={<Globe />}
          />
          <ProfileCard label="Avatar URL" value={profile.avatar_url || "None set"} icon={<Image />} />
        </div>
      </div>
    </div>
  );
}

// Reusable component to display labeled profile information with an icon
function ProfileCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-5 flex gap-4 items-start">
      <div className="text-blue-600 dark:text-blue-400 mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-base font-medium text-gray-900 dark:text-white break-words">{value}</p>
      </div>
    </div>
  );
}
