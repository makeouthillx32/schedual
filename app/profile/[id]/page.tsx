// @ts-nocheck
import type React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import {
  UserCircle2,
  Mail,
  ShieldCheck,
  CalendarClock,
  LogIn,
  Users,
  ImageIcon,
  BadgeCheck,
  KeyRound,
  Globe,
} from "lucide-react"
import type { Metadata } from "next"
import DeleteAccount from "@/components/profile/DeleteAccount";
import InviteGeneratorClient from "@/components/invite/InviteGeneratorClient";
import AdminDelete from "@/components/profile/AdminDelete";
import ManualRoleEditor from "@/components/profile/ManualRoleEditor";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "User Profile",
  }
}

interface ProfilePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  await searchParams;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app"
  const cookieHeader = cookies().toString()

  const profileRes = await fetch(`${baseUrl}/api/profile`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  })
  const profile = await profileRes.json()

  const authRes = await fetch(`${baseUrl}/api/get-all-users`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  })
  const allUsers = await authRes.json()

  if (!profileRes.ok || !profile) {
    return <div className="text-center py-10 text-red-600">User not found or unauthorized.</div>
  }

  const realId = id === "me" ? profile.id : id;

  if (profile.id !== realId) {
    return redirect(`/profile/me`);
  }

  let roleLabel = "User";

  if (profile?.role) {
    const roleRes = await fetch(`${baseUrl}/api/profile/role-label?role_id=${profile.role}`, {
      cache: "no-store",
      headers: { cookie: cookieHeader },
    });

    if (roleRes.ok) {
      const roleData = await roleRes.json();
      roleLabel = roleData.role || "User";
    }
  }

  const matchingUser = allUsers.find((user) => user.id === profile.id);
  const displayName = matchingUser?.display_name || "Unnamed User";

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col items-center space-y-8">
        <div className="relative">
          <UserCircle2 className="h-32 w-32 text-gray-300 dark:text-gray-700" />
          {profile.role && (
            <BadgeCheck className="absolute bottom-0 right-0 h-6 w-6 text-green-500 bg-white rounded-full p-1" />
          )}
        </div>
        <h1 className="text-4xl font-extrabold text-center dark:text-white">{displayName}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{roleLabel}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-10">
          <ProfileCard label="User ID" value={profile.id} icon={<Users />} />
          <ProfileCard label="Email" value={profile.email} icon={<Mail />} />
          <ProfileCard label="Role" value={roleLabel || "N/A"} icon={<ShieldCheck />} />
          <ProfileCard label="Email Confirmed" value={profile.email_confirmed_at ? "Yes" : "No"} icon={<KeyRound />} />
          <ProfileCard label="Created At" value={new Date(profile.created_at).toLocaleString()} icon={<CalendarClock />} />
          <ProfileCard label="Last Signed In" value={new Date(profile.last_sign_in_at).toLocaleString()} icon={<LogIn />} />
          <ProfileCard label="Auth Providers" value={profile.app_metadata?.providers?.join(", ") || "Unknown"} icon={<Globe />} />
          <ProfileCard label="Avatar URL" value={profile.avatar_url || "None set"} icon={<ImageIcon />} />
        </div>

        {/* ✅ Invite Generator */}
        <div className="w-full mt-8">
          <InviteGeneratorClient />
        </div>

        {/* ✅ Delete Account */}
        <div className="w-full mt-4">
          <DeleteAccount />
        </div>

        {/* ✅ Admin Delete & Role Editor */}
        <div className="w-full mt-4 space-y-6">
          <AdminDelete />
          <ManualRoleEditor />
        </div>
      </div>
    </div>
  )
}

function ProfileCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-5 flex gap-4 items-start">
      <div className="text-blue-600 dark:text-blue-400 mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-base font-medium text-gray-900 dark:text-white break-words">{value}</p>
      </div>
    </div>
  )
}
