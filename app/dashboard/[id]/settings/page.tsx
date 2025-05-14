import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { PersonalInfoForm } from "./_components/personal-info";
import { UploadPhotoForm } from "./_components/upload-photo";
import ManualRoleEditor from "@/components/profile/ManualRoleEditor";
import AdminUserManager from "@/components/profile/AdminDelete";
import { getUserProfile } from "@/lib/getUserProfile";

export const metadata: Metadata = {
  title: "Settings Page",
};

export default async function SettingsPage() {
  const profile = await getUserProfile();

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Settings" />

      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-5 xl:col-span-3">
          <PersonalInfoForm />
        </div>
        <div className="col-span-5 xl:col-span-2">
          <UploadPhotoForm />
        </div>
      </div>

      {profile?.role === "admin" && (
        <div className="mt-12 space-y-12">
          <ManualRoleEditor />
          <AdminUserManager />
        </div>
      )}
    </div>
  );
}