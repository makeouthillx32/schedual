"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CameraIcon } from "./_components/icons";

export default function Page() {
  const [data, setData] = useState({
    displayName: "Loading...",
    profilePhoto: "/images/user/user-03.png",
    coverPhoto: "/images/cover/cover-01.png",
    email: "",
    id: "",
    role: "",
    email_confirmed_at: null,
    last_sign_in_at: "",
    providers: [],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/profile");
      const result = await res.json();
      setData({
        displayName: result.user_metadata.display_name,
        profilePhoto: result.avatar_url,
        coverPhoto: "/images/cover/cover-01.png",
        email: result.email,
        id: result.id,
        role: result.role,
        email_confirmed_at: result.email_confirmed_at,
        last_sign_in_at: result.last_sign_in_at,
        providers: result.app_metadata?.providers || [],
      });
    };
    fetchProfile();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[970px]">
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="relative z-20 h-35 md:h-65">
          <Image
            src={data.coverPhoto}
            alt="profile cover"
            className="h-full w-full rounded-tl-[10px] rounded-tr-[10px] object-cover object-center"
            width={970}
            height={260}
            style={{ width: "auto", height: "auto" }}
          />
        </div>

        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-[176px] sm:p-3">
            <div className="relative drop-shadow-2">
              <Image
                src={data.profilePhoto}
                width={160}
                height={160}
                className="rounded-full object-cover"
                alt="profile"
              />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="mb-1 text-heading-6 font-bold text-dark dark:text-white">
              {data.displayName}
            </h3>
            <p className="font-medium text-gray-500 dark:text-gray-400">
              {data.role || "User"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-10 text-left">
              <Info label="User ID" value={data.id} />
              <Info label="Email" value={data.email} />
              <Info label="Role" value={data.role} />
              <Info label="Email Confirmed" value={data.email_confirmed_at ? "Yes" : "No"} />
              <Info label="Last Signed In" value={new Date(data.last_sign_in_at).toLocaleString()} />
              <Info label="Auth Providers" value={data.providers.join(", ") || "Unknown"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-5">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-base font-medium text-gray-900 dark:text-white break-words">{value}</p>
    </div>
  );
}
