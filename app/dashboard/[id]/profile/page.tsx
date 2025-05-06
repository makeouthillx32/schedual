"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { supabase } from "@/lib/supabaseClient";
import DeleteAccount from "@/components/profile/DeleteAccount";

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profile, setProfile] = useState({
    id: "",
    email: "",
    role: "",
    email_confirmed_at: "",
    created_at: "",
    last_sign_in_at: "",
    display_name: "",
    avatar_url: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/profile");
      if (!res.ok) return;
      const data = await res.json();
      setProfile({
        id: data.id,
        email: data.email,
        role: data.role,
        email_confirmed_at: data.email_confirmed_at,
        created_at: data.created_at,
        last_sign_in_at: data.last_sign_in_at,
        display_name: data.user_metadata.display_name,
        avatar_url: data.avatar_url,
      });
    }
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const filePath = `${profile.id}.png`;
    setUploading(true);
    setMessage(null);

    await supabase.storage.from("avatars").remove([filePath]);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, selectedFile, { upsert: true });

    if (uploadError) {
      setUploading(false);
      setMessage({ type: "error", text: uploadError.message });
      return;
    }

    const timestamp = Date.now();
    const publicUrl = `https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/avatars/${filePath}?t=${timestamp}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", profile.id);

    setUploading(false);

    if (updateError) {
      setMessage({ type: "error", text: updateError.message });
    } else {
      setMessage({ type: "success", text: "Avatar uploaded and profile updated!" });
      location.reload();
    }
  };

  return (
    <div className="mx-auto w-full max-w-[970px]">
      <Breadcrumb pageName="Profile" />

      {message && (
        <div
          className={`rounded-lg p-4 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="relative z-20 h-35 md:h-65">
          <Image
            src="/images/cover/cover-01.png"
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
                src={profile.avatar_url}
                width={160}
                height={160}
                className="overflow-hidden rounded-full object-cover"
                alt="profile"
              />
              <label
                htmlFor="profilePhoto"
                className="absolute bottom-0 right-0 flex size-8.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"
              >
                <input
                  type="file"
                  name="profilePhoto"
                  id="profilePhoto"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept="image/png, image/jpg, image/jpeg"
                />
                "+"
              </label>
            </div>
            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <h3 className="mb-1 text-heading-6 font-bold text-dark dark:text-white">
              {profile.display_name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-w-xl mx-auto text-left">
              <Info label="User ID" value={profile.id} />
              <Info label="Email" value={profile.email} />
              <Info label="Role" value={profile.role} />
              <Info label="Email Confirmed" value={profile.email_confirmed_at ? "Yes" : "No"} />
              <Info label="Auth Providers" value={profile.app_metadata?.providers?.join(", ") || "Unknown"} />
              <Info label="Last Signed In" value={new Date(profile.last_sign_in_at).toLocaleString()} />
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-5">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-base font-medium text-gray-900 dark:text-white break-words">{value}</p>
    </div>
  );
}
