// app/profile/[id]/page.tsx
import ProfileCard from "@/components/profile/ProfileCard";

interface Props {
  params: {
    id: string;
  };
}

export default async function ProfilePage({ params }: Props) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/profile?id=${params.id}`, {
    cache: "no-store",
  });

  const profile = await res.json();

  if (!res.ok || profile.error) {
    return <div className="p-10 text-center">User not found</div>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <ProfileCard profile={profile} />
    </div>
  );
}
