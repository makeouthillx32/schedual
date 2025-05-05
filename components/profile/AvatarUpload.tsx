"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function AvatarUpload({ userId }: { userId: string }) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return;

    const filePath = `${userId}.png`;
    setUploading(true);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", userId);

    setUploading(false);

    if (updateError) {
      alert("Failed to update profile: " + updateError.message);
    } else {
      alert("Avatar updated!");
      location.reload();
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <label
        htmlFor="avatar-upload"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Upload new avatar
      </label>

      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        title="Choose a profile picture"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {previewUrl && (
        <div className="flex flex-col items-center space-y-2">
          <Image
            src={previewUrl}
            alt="Image Preview"
            width={128}
            height={128}
            className="rounded-full object-cover border"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}
    </div>
  );
}
