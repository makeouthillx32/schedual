import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Alert } from "@/components/ui-elements/alert";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DeleteAccount from "@/components/profile/DeleteAccount";
import Image from "next/image";

export default function ProfilePage({ userId }: { userId: string }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState<null | { type: "success" | "error"; message: string }>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const filePath = `${userId}.png`;
    setUploading(true);
    setAlert(null);

    await supabase.storage.from("avatars").remove([filePath]);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, selectedFile, { upsert: true });

    if (uploadError) {
      setAlert({ type: "error", message: `Upload failed: ${uploadError.message}` });
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
      setAlert({ type: "error", message: `Upload succeeded, but profile update failed: ${updateError.message}` });
    } else {
      setAlert({ type: "success", message: "Avatar uploaded and profile updated!" });
      location.reload();
    }
  };

  return (
    <div className="mx-auto w-full max-w-[970px]">
      <Breadcrumb pageName="Profile" />

      {alert && (
        <div className="mb-4">
          <Alert
            variant={alert.type}
            title={alert.type === "success" ? "Success" : "Error"}
            description={alert.message}
          />
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
          />
        </div>

        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-44 w-44 rounded-full bg-white/20 p-1 backdrop-blur">
            <div className="relative drop-shadow-2">
              <Image
                src={`https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/avatars/${userId}.png`}
                width={176}
                height={176}
                className="rounded-full object-cover"
                alt="profile"
              />
              <label
                htmlFor="profilePhoto"
                className="absolute bottom-2 right-2 flex size-8.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90"
              >
                <span className="sr-only">Upload</span>
                ✎
                <input
                  type="file"
                  name="profilePhoto"
                  id="profilePhoto"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept="image/png, image/jpg, image/jpeg"
                />
              </label>
            </div>
          </div>

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          )}

          <div className="mt-6">
            <DeleteAccount />
          </div>
        </div>
      </div>
    </div>
  );
}
