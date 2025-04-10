import { getUserProfileById } from "@/lib/getUserProfile";
import ProfileCard from "@/components/profile/ProfileCard";

type Props = {
  params: { id: string };
};

export default async function ProfilePage({ params }: Props) {
  const profile = await getUserProfileById(params.id);

  if (!profile) {
    return <div className="p-10 text-center">User not found</div>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <ProfileCard profile={profile} />
    </div>
  );
}
