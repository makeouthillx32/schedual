"use client";

import { useEffect, useState } from "react";
import { UploadIcon } from "@/assets/icons";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export function UploadPhotoForm() {
  const [userId, setUserId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return;
      const data = await res.json();
      setUserId(data.id);
      setAvatarUrl(data.avatar_url);
    };

    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    const filePath = `${userId}.png`;
    setUploading(true);

    await supabase.storage.from("avatars").remove([filePath]);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, selectedFile, { upsert: true });

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const timestamp = Date.now();
    const publicUrl = `https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/avatars/${filePath}?t=${timestamp}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    setUploading(false);

    if (updateError) {
      alert("Upload succeeded, but profile update failed: " + updateError.message);
    } else {
      alert("Avatar uploaded and profile updated!");
      location.reload();
    }
  };

  return (
    <ShowcaseSection title="Your Photo" className="!p-7">
      <div className="mb-4 flex items-center gap-3">
        <Image
          src={avatarUrl || "/images/user/user-03.png"}
          width={55}
          height={55}
          alt="User"
          className="size-14 rounded-full object-cover"
          quality={90}
        />

        <div>
          <span className="mb-1.5 font-medium text-dark dark:text-white">
            Edit your photo
          </span>
          <span className="flex gap-3">
            <button type="button" className="text-body-sm hover:text-red">
              Delete
            </button>
            <button
              type="button"
              onClick={handleUpload}
              className="text-body-sm hover:text-primary"
            >
              {uploading ? "Uploading..." : "Update"}
            </button>
          </span>
        </div>
      </div>

      <div className="relative mb-5.5 block w-full rounded-xl border border-dashed border-gray-4 bg-gray-2 hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary">
        <input
          type="file"
          name="profilePhoto"
          id="profilePhoto"
          accept="image/png, image/jpg, image/jpeg"
          hidden
          onChange={handleFileChange}
          disabled={uploading}
        />

        <label
          htmlFor="profilePhoto"
          className="flex cursor-pointer flex-col items-center justify-center p-4 sm:py-7.5"
        >
          <div className="flex size-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
            <UploadIcon />
          </div>

          <p className="mt-2.5 text-body-sm font-medium">
            <span className="text-primary">Click to upload</span> or drag and drop
          </p>

          <p className="mt-1 text-body-xs">
            SVG, PNG, JPG or GIF (max, 800 X 800px)
          </p>
        </label>
      </div>
    </ShowcaseSection>
  );
}