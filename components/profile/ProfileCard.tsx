// @ts-nocheck
import type React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { UserCircle2, BadgeCheck } from "lucide-react";
import type { Metadata } from "next";
import ProfileCard from "@/components/profile/ProfileCard";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "User Profile",
  };
}

interface ProfilePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  await searchParams;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";
  const cookieHeader = cookies().toString();
  const res = await fetch(`${baseUrl}/api/profile`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
    },
  });

  const profile = await res.json();

  if (!res.ok || !profile) {
    return <div className="text-center py-10 text-red-600">User not found or unauthorized.</div>;
  }

  if (profile.id !== id) {
    return redirect(`/profile/${profile.id}`);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col items-center space-y-8">
        <div className="relative">
          <UserCircle2 className="h-32 w-32 text-gray-300 dark:text-gray-700" />
          {profile.role && (
            <BadgeCheck className="absolute bottom-0 right-0 h-6 w-6 text-green-500 bg-white rounded-full p-1" />
          )}
        </div>
        <h1 className="text-4xl font-extrabold text-center dark:text-white">{profile.email}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{profile.role || "User"}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-10">
          <ProfileCard label="User ID" value={profile.id} icon="Users" />
          <ProfileCard label="Email" value={profile.email} icon="Mail" />
          <ProfileCard label="Role" value={profile.role || "N/A"} icon="ShieldCheck" />
          <ProfileCard label="Email Confirmed" value={profile.email_confirmed_at ? "Yes" : "No"} icon="KeyRound" />
          <ProfileCard label="Created At" value={new Date(profile.created_at).toLocaleString()} icon="CalendarClock" />
          <ProfileCard label="Last Signed In" value={new Date(profile.last_sign_in_at).toLocaleString()} icon="LogIn" />
          <ProfileCard
            label="Auth Providers"
            value={profile.app_metadata?.providers?.join(", ") || "Unknown"}
            icon="Globe"
          />
          <ProfileCard label="Avatar URL" value={profile.avatar_url || "None set"} icon="ImageIcon" />
        </div>
      </div>
    </div>
  );
}