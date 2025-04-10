// app/profile/[id]/page.tsx
import { getUserProfileById } from "@/lib/getUserProfile"; // you'll write this helper
import ProfileCard from "@/components/profile/ProfileCard";

export default async function ProfilePage({ params }: { params: { id: string } }) {
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
