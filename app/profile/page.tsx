import { getUserProfile } from "@/lib/getUserProfile";
import ProfileCard from "@/components/profile/ProfileCard";
import AvatarUpload from "@/components/profile/AvatarUpload";

export default async function ProfilePage() {
  const profile = await getUserProfile();

  if (!profile) {
    return <p className="text-center p-10">Not logged in.</p>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <ProfileCard profile={profile} />
      <AvatarUpload userId={profile.id} />
    </div>
  );
}
