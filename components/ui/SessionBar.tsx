"use client";

import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SessionBar() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) return null;

  return (
    <div className="bg-green-100 text-green-900 p-4 rounded flex justify-between items-center mb-4">
      <p>
        ✅ Signed in as <strong>{session.user.email}</strong>
      </p>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.replace("/sign-in");
        }}
        className="bg-red-600 text-white px-3 py-1 rounded"
      >
        Log out
      </button>
    </div>
  );
}
