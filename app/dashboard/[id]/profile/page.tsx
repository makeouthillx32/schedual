"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import DeleteAccount from "@/components/profile/DeleteAccount";

export default function Page() {
  const [data, setData] = useState({
    name: "",
    profilePhoto: "",
    coverPhoto: "/images/cover/cover-01.png",
    email: "",
    userId: "",
    role: "",
    emailConfirmed: false,
    lastSignIn: "",
    providers: [],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return;
      const user = await res.json();

      setData({
        name: user.user_metadata.display_name,
        profilePhoto: user.avatar_url,
        coverPhoto: "/images/cover/cover-01.png",
        email: user.email,
        userId: user.id,
        role: user.role,
        emailConfirmed: !!user.email_confirmed_at,
        lastSignIn: user.last_sign_in_at,
        providers: user.app_metadata?.providers || [],
      });
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const filePath = `${data.userId}.png`;
    setUploading(true);
    await supabase.storage.from("avatars").remove([filePath]);
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, selectedFile, { upsert: true });
    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }
    const timestamp = Date.now();
    const publicUrl = `https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/avatars/${filePath}?t=${timestamp}`;
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", data.userId);
    setUploading(false);
    if (updateError) {
      alert("Upload succeeded, but profile update failed: " + updateError.message);
    } else {
      alert("Avatar uploaded and profile updated!");
      location.reload();
    }
  };

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
          />
        </div>

        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-[176px] sm:p-3">
            <div className="relative drop-shadow-2">
              {data.profilePhoto && (
                <>
                  <Image
                    src={data.profilePhoto}
                    width={160}
                    height={160}
                    className="overflow-hidden rounded-full object-cover"
                    alt="profile"
                  />
                  <label
                    htmlFor="file-upload"
                    className="absolute bottom-0 right-0 flex size-8.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"
                  >
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="sr-only"
                    />
                    <span className="sr-only">Edit</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2L9 13l-1 4 4-1 6-6z" />
                    </svg>
                  </label>
                </>
              )}
            </div>
          </div>

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 mt-4 rounded hover:bg-blue-700"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          )}

          <div className="mt-8 space-y-4">
            <div className="text-dark dark:text-white font-bold text-lg">{data.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{data.role}</div>
          </div>

          <div className="mt-6 space-y-4 text-left max-w-md mx-auto">
            <Info label="User ID" value={data.userId} />
            <Info label="Email" value={data.email} />
            <Info label="Email Confirmed" value={data.emailConfirmed ? "Yes" : "No"} />
            <Info label="Last Sign In" value={new Date(data.lastSignIn).toLocaleString()} />
            <Info label="Auth Providers" value={data.providers.join(", ")} />
          </div>

          <div className="mt-10">
            <DeleteAccount />
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
