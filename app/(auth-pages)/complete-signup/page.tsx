"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CompleteSignup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invite = searchParams.get('invite');

  useEffect(() => {
    if (!invite) {
      router.replace('/error');
      return;
    }

    (async () => {
      const res = await fetch('/api/apply-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite }),
      });

      if (res.ok) {
        router.replace('/dashboard'); // or wherever your app's home is
      } else {
        router.replace('/error');
      }
    })();
  }, [invite, router]);

  return (
    <p className="p-10 text-center text-sm text-gray-600 dark:text-gray-300">
      Applying your invite and finishing setup...
    </p>
  );
}