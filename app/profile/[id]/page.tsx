// @ts-nocheck
import type React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import {
  UserCircle2,
  BadgeCheck,
} from "lucide-react"
import type { Metadata } from "next"
import { ProfileCard } from "@/components/profile/ProfileCard"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "User Profile",
  }
}

// Updated interface to make both params and searchParams Promises
interface ProfilePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  // Resolve the params and searchParams promises
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // Also await searchParams (though we don't need it in this component)
  await searchParams;
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app"
  const cookieHeader = cookies().toString()
  const res = await fetch(`${baseUrl}/api/profile`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
    },
  })
  const profile = await res.json()
  if (!res.ok || !profile) {
    return <div className="text-center py-10 text-red-600">User not found or unauthorized.</div>
  }
  if (profile.id !== id) {
    return redirect(`/profile/${profile.id}`)
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
          <ProfileCard profile={profile} />
        </div>
      </div>
    </div>
  )
}