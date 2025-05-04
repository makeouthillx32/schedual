// app/dashboard/[id]/page.tsx
// ——————————————————————————————
// Mirrors the structure of app/profile/[id]/page.tsx :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}

import type React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import AdminApp from "@/components/AdminDashboard/App";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Dashboard",
  };
}

interface DashboardPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({
  params,
  searchParams,
}: DashboardPageProps) {
  const { id } = await params;
  await searchParams;

  // forward cookies so your API can auth the user
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    "https://schedual-five.vercel.app";
  const cookieHeader = cookies().toString();

  // reuse your profile check to ensure the user is signed in
  const profileRes = await fetch(`${baseUrl}/api/profile`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });
  if (!profileRes.ok) {
    // not signed in or no profile → send to sign in
    return redirect("/sign-in");
  }
  const profile = await profileRes.json();

  // handle the “me” alias just like profile page
  const realId = id === "me" ? profile.id : id;
  if (profile.id !== realId) {
    // trying to view someone else’s dashboard? bounce back to your own
    return redirect("/dashboard/me");
  }

  // finally, render your AdminApp with the resolved userId
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <AdminApp userId={profile.id} />
    </div>
  );
}
