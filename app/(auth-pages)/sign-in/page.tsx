"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load SignInForm since it uses useSearchParams()
const SignInForm = dynamic(() => import("@/components/SignInForm"), {
  ssr: false,
});

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}