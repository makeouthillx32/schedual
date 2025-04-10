import { getUserProfileById } from "@/lib/getUserProfile";
import ProfileCard from "@/components/profile/ProfileCard";

export default async function ProfilePage(props: { params: { id: string } }) {
  const profile = await getUserProfileById(props.params.id);

  if (!profile) {
    return <div className="p-10 text-center">User not found</div>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <ProfileCard profile={profile} />
    </div>
  );
}
