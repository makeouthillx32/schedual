// app/settings/[...setting]/page.tsx
import { RedirectType, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import dynamic from "next/dynamic";
import type { FC } from "react";
import { Settings, User, ShoppingCart, Calendar, Clock, CreditCard } from "lucide-react";
import { SettingsToast } from "@/components/settings/SettingsToast";

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
  
  // Tools settings - only include existing ones
  "Tools/punch-card-maker": dynamic(() => import("@/components/settings/punch-card-maker-settings")) as DynComp,
  "Tools/timesheet-calculator": dynamic(() => import("@/components/settings/timesheet-calculator-settings")) as DynComp,
};

// Map settings to icons
const settingIcons: Record<string, JSX.Element> = {
  "": <User size={20} />,
  profile: <User size={20} />,
  catalog: <ShoppingCart size={20} />,
  CMS: <Calendar size={20} />,
  "CMS/schedule": <Calendar size={20} />,
  
  // Tools icons - only for existing tools
  "Tools/timesheet-calculator": <Clock size={20} />,
  "Tools/punch-card-maker": <CreditCard size={20} />,
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

  // Handle authentication and role-based access
  if (!session) {
    const target = "/settings/" + settingPath;
    
    // Show toast for unauthenticated users
    return (
      <SettingsToast 
        type="auth"
        message="Company feature - Please sign in to access settings"
        redirectTo={`/sign-in?redirect_to=${encodeURIComponent(target)}`}
      />
    );
  }

  // Get user profile and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const userRole = profile?.role;
  const allowedRoles = ['admin', 'jobcoach', 'client'];

  // Check if user has proper role
  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <SettingsToast 
        type="role"
        message="Access denied - Please contact administrator for proper role assignment"
        userRole={userRole}
        redirectTo="/dashboard"
      />
    );
  }

  // Handle settings component selection
  const SettingsComponent = settingsMap[settingPath];
  if (!SettingsComponent) {
    return (
      <SettingsToast 
        type="missing"
        message="Settings page not found - Redirecting to profile settings"
        redirectTo="/settings/profile"
      />
    );
  }

  const settingTitle = getSettingTitle(settingPath);
  const settingIcon = settingIcons[settingPath] || <Settings size={20} />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <div className="p-2 rounded-full bg-[hsl(var(--sidebar-primary))]/10 text-[hsl(var(--sidebar-primary))] mr-3">
            {settingIcon}
          </div>
          <h1 className="text-2xl font-[var(--font-serif)] font-bold text-[hsl(var(--foreground))] leading-[1.2]">
            {settingTitle}
          </h1>
        </div>
        <p className="text-[hsl(var(--muted-foreground))] font-[var(--font-sans)] leading-[1.5]">
          {getSettingDescription(settingPath)}
        </p>
      </div>

      <div className="p-6 rounded-[var(--radius)] shadow-[var(--shadow-md)] bg-[hsl(var(--card))]">
        <SettingsComponent />
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
    "CMS/schedule": "Schedule Settings",
    
    // Tools titles - only for existing tools
    "Tools/timesheet-calculator": "Timesheet Calculator Settings",
    "Tools/punch-card-maker": "Punch Card Maker Settings", 
  };
  
  return titles[settingPath] || "Settings";
}

// Helper function to generate setting descriptions
function getSettingDescription(settingPath: string): string {
  const descriptions: Record<string, string> = {
    "": "Manage your account preferences and personal information",
    profile: "Update your profile information and account preferences",
    catalog: "Manage your product catalog and inventory settings",
    CMS: "Configure your content management system settings",
    "CMS/schedule": "Customize your cleaning schedule and team assignments",
    
    // Tools descriptions - only for existing tools
    "Tools/timesheet-calculator": "Customize timesheet calculation preferences and default settings",
    "Tools/punch-card-maker": "Configure punch card templates, layouts, and printing preferences",
  };
  
  return descriptions[settingPath] || "Manage your settings and preferences";
}