"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const successMessage = searchParams.get("success");
  const errorMessage = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      router.refresh(); // 🔄 refresh to force session update
      router.push("/CMS"); // 👈 redirect to last page or CMS
    }
  };

  return (
    <form className="flex-1 flex flex-col min-w-64" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-medium">Sign in</h1>
      <p className="text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          Sign up
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input
          name="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Link className="text-xs text-foreground underline" href="/forgot-password">
            Forgot Password?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <SubmitButton pendingText="Signing In...">Sign in</SubmitButton>

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {successMessage && <div className="text-green-500 text-sm mt-2">{successMessage}</div>}
        {errorMessage && <div className="text-red-500 text-sm mt-2">{errorMessage}</div>}
      </div>
    </form>
  );
}
