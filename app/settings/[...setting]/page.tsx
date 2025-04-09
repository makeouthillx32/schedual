import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { Metadata } from "next";

// Settings component map
const settingsMap: Record<string, React.ComponentType<any>> = {
  catalog: dynamic(() => import("@/components/settings/catalog-settings")),
  profile: dynamic(() => import("@/components/settings/profile-settings")),
  CMS: dynamic(() => import("@/components/settings/cms-settings")),
  "CMS/schedule": dynamic(() => import("@/app/CMS/schedule/page")),
};

interface SettingsPageProps {
  params: {
    setting: string[];
  };
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const settingKey = params.setting.join("/"); // supports CMS/schedule
  const SettingsComponent = settingsMap[settingKey];

  if (!SettingsComponent) {
    notFound();
    return null;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <SettingsComponent />
    </div>
  );
}