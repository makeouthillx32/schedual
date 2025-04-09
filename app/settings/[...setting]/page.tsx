import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import type { FC } from "react";

// Explicitly define the type of the loaded component
type DynamicComponent = FC<{}>;

// Cast every dynamic import to DynamicComponent to avoid Promise type confusion
const settingsMap: Record<string, DynamicComponent> = {
  catalog: dynamic(() => import("@/components/settings/catalog-settings")) as DynamicComponent,
  profile: dynamic(() => import("@/components/settings/profile-settings")) as DynamicComponent,
  CMS: dynamic(() => import("@/components/settings/cms-settings")) as DynamicComponent,
  "CMS/schedule": dynamic(() => import("@/components/settings/cms-settings")) as DynamicComponent,
};

// Explicit function signature with no PageProps constraint
export default function SettingsPage({
  params,
}: {
  params: { setting: string[] };
}) {
  const settingKey = params.setting.join("/");
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