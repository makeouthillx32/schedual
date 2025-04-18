"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";

export default function SignInForm() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.refresh();
      router.push("/CMS");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        autoComplete="on"
        className="w-full max-w-sm bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md space-y-5"
      >
        <h1 className="text-2xl font-semibold text-center text-black dark:text-white">Sign in</h1>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="w-full px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors"
        >
          Sign in
        </button>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </form>
    </div>
  );
}