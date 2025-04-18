"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load SignInForm since it uses useSearchParams()
const SignInForm = dynamic(() => import("@/components/SignInForm"), {
  ssr: false,
});

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-black transition-colors">
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
