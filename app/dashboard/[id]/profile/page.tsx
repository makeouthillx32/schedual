"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DeleteAccount from "@/components/profile/DeleteAccount";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CameraIcon } from "./_components/icons";

export default function Page() {
  const [data, setData] = useState({
    name: "Loading...",
    email: "",
    avatar_url: "/images/user/user-03.png",
    coverPhoto: "/images/cover/cover-01.png",
    role: "",
    id: "",
    email_confirmed: false,
    providers: [],
    last_sign_in: "",
  });

  useEffect(() => {
    const getProfile = async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return;
      const user = await res.json();

      setData({
        name: user.user_metadata.display_name,
        email: user.email,
        avatar_url: user.avatar_url,
        coverPhoto: "/images/cover/cover-01.png",
        role: user.role,
        id: user.id,
        email_confirmed: !!user.email_confirmed_at,
        providers: user.app_metadata?.providers || [],
        last_sign_in: user.last_sign_in_at,
      });
    };

    getProfile();
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
          <div className="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
            <label
              htmlFor="cover"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-[15px] py-[5px] text-body-sm font-medium text-white hover:bg-opacity-90"
            >
              <CameraIcon />
              <span>Edit</span>
              <input
                type="file"
                name="coverPhoto"
                id="coverPhoto"
                className="sr-only"
                accept="image/png, image/jpg, image/jpeg"
              />
            </label>
          </div>
        </div>

        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 aspect-square h-32 w-32 sm:h-44 sm:w-44 rounded-full bg-white/20 p-1 backdrop-blur">
            <div className="relative w-full h-full drop-shadow-2 rounded-full overflow-hidden">
              <Image
                src={data.avatar_url}
                fill
                className="object-cover"
                alt="profile"
              />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="mb-1 text-heading-6 font-bold text-dark dark:text-white">
              {data.name}
            </h3>
            <p className="font-medium text-dark dark:text-white mb-4">
              {data.role}
            </p>

            <div className="space-y-4 max-w-lg mx-auto">
              <InfoCard label="User ID" value={data.id} />
              <InfoCard label="Email" value={data.email} />
              <InfoCard label="Email Confirmed" value={data.email_confirmed ? "Yes" : "No"} />
              <InfoCard label="Auth Providers" value={data.providers.join(", ")} />
              <InfoCard label="Last Signed In" value={new Date(data.last_sign_in).toLocaleString()} />
            </div>

            <div className="mt-10">
              <DeleteAccount />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-dark-3 bg-dark-2 px-5 py-4 text-left shadow-card">
      <p className="text-sm font-medium uppercase text-gray-400 mb-1">{label}</p>
      <p className="text-base font-semibold text-white break-words">{value}</p>
    </div>
  );
}
