"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function AvatarUpload({ userId }: { userId: string }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    const filePath = `${userId}.png`
    setUploading(true)

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, selectedFile, { upsert: true })

    if (uploadError) {
      alert("Upload failed: " + uploadError.message)
    } else {
      alert("Upload successful!")
      location.reload()
    }

    setUploading(false)
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <label htmlFor="file-upload" className="sr-only">Choose File</label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        placeholder="Upload an image"
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
  )
}
