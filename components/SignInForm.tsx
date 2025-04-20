"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRef, useState } from "react";
import Link from "next/link";

export default function SignInForm() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.refresh();
      router.push("/CMS");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        autoComplete="on"
        className="w-full max-w-sm bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md space-y-5"
      >
        <h1 className="text-2xl font-semibold text-center text-black dark:text-white">Sign in</h1>

        <div>
          <label htmlFor="email" className="block text-sm mb-1 text-black dark:text-white">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            ref={emailRef}
            placeholder="you@example.com"
            className="w-full px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm mb-1 text-black dark:text-white">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            ref={passwordRef}
            placeholder="••••••••"
            className="w-full px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Forgot your password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors"
        >
          Sign in
        </button>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Don’t have an account?{" "}
          <Link href="/sign-up" className="text-blue-600 hover:underline dark:text-blue-400">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}