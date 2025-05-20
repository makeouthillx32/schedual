import { RedirectType, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import dynamic from "next/dynamic";
import type { FC } from "react";
import { Settings, User, ShoppingCart, Calendar } from "lucide-react";

type DynComp = FC<{}>;

const settingsMap: Record<string, DynComp> = {
  // Add default root component
  "": dynamic(() => import("@/components/settings/profile-settings")) as DynComp,
  catalog: dynamic(() => import("@/components/settings/catalog-settings")) as DynComp,
  profile: dynamic(() => import("@/components/settings/profile-settings")) as DynComp,
  CMS: dynamic(() => import("@/components/settings/cms-settings")) as DynComp,
  "CMS/schedule": dynamic(
    () => import("@/components/settings/cms-settings")
  ) as DynComp,
};

// Map settings to icons
const settingIcons: Record<string, JSX.Element> = {
  "": <User size={20} />,
  profile: <User size={20} />,
  catalog: <ShoppingCart size={20} />,
  CMS: <Calendar size={20} />,
  "CMS/schedule": <Calendar size={20} />,
};

export default async function SettingsPage(
  props: { params: Promise<{ setting?: string[] }> }
) {
  const { setting = [] } = await props.params;
  const settingPath = setting.join("/");

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // not needed here
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const target = "/settings/" + settingPath;
    redirect(`/sign-in?redirect_to=${encodeURIComponent(target)}`, RedirectType.replace);
  }

  // Handle settings navigation
  const SettingsComponent = settingsMap[settingPath];
  if (!SettingsComponent) {
    redirect("/settings/profile", RedirectType.replace);
  }

  const settingTitle = getSettingTitle(settingPath);
  const settingIcon = settingIcons[settingPath] || <Settings size={20} />;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-[hsl(var(--sidebar-primary))]/10 text-[hsl(var(--sidebar-primary))] mr-3">
            {settingIcon}
          </div>
          <h1 className="text-2xl font-[var(--font-serif)] font-bold text-[hsl(var(--foreground))] leading-[1.2]">
            {settingTitle}
          </h1>
        </div>
        <p className="text-[hsl(var(--muted-foreground))] font-[var(--font-sans)] leading-[1.5]">
          Manage your {settingPath || "account"} settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="space-y-1 sticky top-4">
            <SettingsNavigation currentPath={settingPath} />
          </nav>
        </div>
        
        <div className="lg:col-span-3">
          <div className="p-6 rounded-[var(--radius)] shadow-[var(--shadow-md)] bg-[hsl(var(--card))]">
            <SettingsComponent />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate human-readable setting titles
function getSettingTitle(settingPath: string): string {
  if (!settingPath) return "Account Settings";
  
  const titles: Record<string, string> = {
    profile: "Profile Settings",
    catalog: "Catalog Settings",
    CMS: "CMS Settings",
    "CMS/schedule": "Schedule Settings"
  };
  
  return titles[settingPath] || "Settings";
}

// Settings Navigation Component
function SettingsNavigation({ currentPath }: { currentPath: string }) {
  const navItems = [
    { path: "profile", label: "Profile" },
    { path: "catalog", label: "Catalog" },
    { path: "CMS", label: "CMS" },
    { path: "CMS/schedule", label: "Schedule" },
  ];
  
  return (
    <div className="rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow-sm)] bg-[hsl(var(--card))]">
      <div className="p-3 bg-[hsl(var(--sidebar-primary))]/10 font-medium font-[var(--font-sans)] text-[hsl(var(--sidebar-primary))]">
        Settings
      </div>
      <div className="p-2">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={`/settings/${item.path}`}
            className={`flex items-center px-3 py-2 rounded-[calc(var(--radius)_-_2px)] font-[var(--font-sans)] transition-colors ${
              currentPath === item.path
                ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"
                : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
            }`}
          >
            {settingIcons[item.path]}
            <span className="ml-2">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}