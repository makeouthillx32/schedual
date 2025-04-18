"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import SignInForm from "@/components/SignInForm";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("refresh") === "true") {
      router.refresh();
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams, router]);

  return <SignInForm />;
}