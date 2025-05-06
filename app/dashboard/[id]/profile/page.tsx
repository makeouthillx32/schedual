"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { CameraIcon } from "../_components/icons";
import DeleteAccount from "@/components/profile/DeleteAccount";
import {
  Mail,
  ShieldCheck,
  CalendarClock,
  LogIn,
  Users,
  KeyRound,
  Globe,
} from "lucide-react";

interface ProfileData {
  display_name: string;
  avatar_url: string;
  email: string;
  id: string;
  role: string;
  email_confirmed_at: string;
  created_at: string;
  last_sign_in_at: string;
  app_metadata: {
    providers?: string[];
  };
}

export default function Page() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [coverPhoto, setCoverPhoto] = useState("/images/cover/cover-01.png");

  useEffect(() => {
    const getProfile = async () => {
      const res = await fetch("/api/profile");
      const user = await res.json();
      setData(user);
    };
    getProfile();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[970px]">
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="relative z-20 h-35 md:h-65">
          <Image
            src={coverPhoto}
            alt="profile cover"
            className="h-full w-full rounded-tl-[10px] rounded-tr-[10px] object-cover object-center"
            width={970}
            height={260}
          />
          <div className="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
            <label
              htmlFor="cover"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-[15px] py-[5px] text-body-sm font-medium text-white hover:bg-opacity-90"
            >
              <input
                type="file"
                name="coverPhoto"
                id="coverPhoto"
                className="sr-only"
                onChange={(e) =>
                  e.target.files?.[0] &&
                  setCoverPhoto(URL.createObjectURL(e.target.files[0]))
                }
                accept="image/png, image/jpg, image/jpeg"
              />
              <CameraIcon />
              <span>Edit</span>
            </label>
          </div>
        </div>

        {data && (
          <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
            <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-[176px] sm:p-3 aspect-square">
              <div className="relative drop-shadow-2">
                <Image
                  src={data.avatar_url}
                  width={160}
                  height={160}
                  className="overflow-hidden rounded-full object-cover w-full h-full"
                  alt="profile"
                />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="mb-1 text-heading-6 font-bold text-dark dark:text-white">
                {data.display_name}
              </h3>
              <p className="font-medium text-gray-500 dark:text-gray-400">
                {data.role}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-10 text-left">
              <Info label="User ID" value={data.id} icon={<Users />} />
              <Info label="Email" value={data.email} icon={<Mail />} />
              <Info label="Role" value={data.role} icon={<ShieldCheck />} />
              <Info
                label="Email Confirmed"
                value={data.email_confirmed_at ? "Yes" : "No"}
                icon={<KeyRound />}
              />
              <Info
                label="Created At"
                value={new Date(data.created_at).toLocaleString()}
                icon={<CalendarClock />}
              />
              <Info
                label="Last Signed In"
                value={new Date(data.last_sign_in_at).toLocaleString()}
                icon={<LogIn />}
              />
              <Info
                label="Auth Providers"
                value={data.app_metadata?.providers?.join(", ") || "Unknown"}
                icon={<Globe />}
              />
            </div>

            <div className="mt-10">
              <DeleteAccount />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-5 flex gap-4 items-start">
      <div className="text-blue-600 dark:text-blue-400 mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
          {label}
        </p>
        <p className="text-base font-medium text-gray-900 dark:text-white break-words">
          {value}
        </p>
      </div>
    </div>
  );
}