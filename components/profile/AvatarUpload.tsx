"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AvatarUpload({ userId }: { userId: string }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const filePath = `${userId}.png`;

    setUploading(true);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, selectedFile, { upsert: true });

    setUploading(false);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
    } else {
      alert("Upload successful. Reload to see changes.");
      location.reload();
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-2">
      <label htmlFor="avatarUpload" className="sr-only">
        Upload avatar
      </label>
      <input
        id="avatarUpload"
        type="file"
        accept="image/*"
        onChange={handleSelect}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        placeholder="Upload avatar"
        title="Choose your avatar image"
      />
      {selectedFile && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      )}
    </div>
  );
}
