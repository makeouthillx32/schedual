"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CompleteSignupInner() {
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
        router.replace('/dashboard');
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

export default function CompleteSignupPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-sm text-gray-600 dark:text-gray-300">Loading...</p>}>
      <CompleteSignupInner />
    </Suspense>
  );
}