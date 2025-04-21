import { getUserProfile } from "@/lib/getUserProfile";
import ProfileCard from "@/components/profile/ProfileCard";
import AvatarUpload from "@/components/profile/AvatarUpload";
import InviteGenerator from "@/components/invite/InviteGenerator"; // ✅ add this import

export default async function ProfilePage() {
  const profile = await getUserProfile();

  if (!profile) {
    return <p className="text-center p-10">Not logged in.</p>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-12">
      <div>
        <ProfileCard profile={profile} />
        <AvatarUpload userId={profile.id} />
      </div>

      {/* ✅ Invite Generator Below */}
      <InviteGenerator />
    </div>
  );
}