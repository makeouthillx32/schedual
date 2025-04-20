import { RedirectType, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import dynamic from "next/dynamic";
import type { FC } from "react";

type DynComp = FC<{}>;

const settingsMap: Record<string, DynComp> = {
  catalog: dynamic(() => import("@/components/settings/catalog-settings")) as DynComp,
  profile: dynamic(() => import("@/components/settings/profile-settings")) as DynComp,
  CMS: dynamic(() => import("@/components/settings/cms-settings")) as DynComp,
  "CMS/schedule": dynamic(
    () => import("@/components/settings/cms-settings")
  ) as DynComp,
};


export default async function SettingsPage(
  /* 1️⃣  params is now a Promise */
  props: { params: Promise<{ setting?: string[] }> }
) {
  /* 2️⃣  await params */
  const { setting = [] } = await props.params;

  /* 3️⃣  get session – await cookies() first */
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},          // not needed here
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const target = "/settings/" + setting.join("/");
    redirect(`/sign-in?redirect_to=${encodeURIComponent(target)}`, RedirectType.replace);
  }

  /* 4️⃣  choose which settings component to render */
  const SettingsComponent = settingsMap[setting.join("/")];
  if (!SettingsComponent) {
    redirect("/404", RedirectType.replace);
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <SettingsComponent />
    </div>
  );
}
