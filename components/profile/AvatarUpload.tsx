"use client";

import { useState } from "react";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export default function AvatarUpload({ userId }: { userId: string }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const s3 = new S3Client({
    region: "us-east-1",
    endpoint: "https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/s3",
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY!,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_KEY!,
    },
    forcePathStyle: true,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const filePath = `${userId}.png`;
    setUploading(true);

    try {
      const command = new PutObjectCommand({
        Bucket: "avatars",
        Key: filePath,
        Body: new Blob([selectedFile]),
        ContentType: selectedFile.type,
        ACL: "public-read",
      });

      await s3.send(command);
      alert("Avatar uploaded successfully!");
      location.reload();
    } catch (error: any) {
      console.error("Upload failed", error);
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <label htmlFor="file-upload" className="sr-only">Choose File</label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      )}
    </div>
  );
}