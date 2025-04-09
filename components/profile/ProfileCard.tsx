// /components/profile/ProfileCard.tsx
"use client";

interface ProfileProps {
  profile: {
    id: string;
    full_name: string;
    role: string;
  };
}

export default function ProfileCard({ profile }: ProfileProps) {
  return (
    <div className="border rounded-lg p-6 shadow bg-white dark:bg-zinc-900">
      <h2 className="text-xl font-bold mb-2">Profile Info</h2>
      <p><strong>Name:</strong> {profile.full_name || "Not set"}</p>
      <p><strong>Role:</strong> {profile.role}</p>
    </div>
  );
}
