"use client";
import SignInForm from "@/components/SignInForm";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("refresh") === "true") {
      router.refresh();
      const newUrl = `${window.location.pathname}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams, router]);

  return <SignInForm />;
}