import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import type { FC } from "react";

type DynamicComponent = FC<{}>;

const settingsMap: Record<string, DynamicComponent> = {
  catalog: dynamic(() => import("@/components/settings/catalog-settings")) as DynamicComponent,
  profile: dynamic(() => import("@/components/settings/profile-settings")) as DynamicComponent,
  CMS: dynamic(() => import("@/components/settings/cms-settings")) as DynamicComponent,
  "CMS/schedule": dynamic(() => import("@/components/settings/cms-settings")) as DynamicComponent,
};

export default function SettingsPage(props: any) {
  const settingArray = props?.params?.setting;

  if (!Array.isArray(settingArray)) {
    notFound();
    return null;
  }

  const settingKey = settingArray.join("/");
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