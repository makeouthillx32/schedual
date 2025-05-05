"use client";

import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import AvatarUpload from "./AvatarUpload";

export default function Avatar({ avatarUrl, userId, role }: {
  avatarUrl: string | null;
  userId: string;
  role?: string;
}) {
  const fallbackUrl = "https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/avatars/default.png";

  return (
    <div className="relative flex flex-col items-center gap-4">
      <Image
        src={avatarUrl || fallbackUrl}
        alt="User Avatar"
        width={128}
        height={128}
        className="rounded-full border-4 border-gray-300 dark:border-zinc-700 object-cover w-32 h-32"
      />
      {role && (
        <BadgeCheck className="absolute bottom-0 right-0 h-6 w-6 text-green-500 bg-white rounded-full p-1" />
      )}
      <AvatarUpload userId={userId} />
    </div>
  );
}