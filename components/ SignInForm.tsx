"use client";

import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";

export default function SignInForm() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.refresh();
      }
    };
    checkSession();
  }, [supabase, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
      router.refresh();
      router.push("/CMS");
    }
  };

  return (
    <form className="flex flex-col min-w-64 max-w-64 mx-auto" onSubmit={handleSignIn}>
      <h1 className="text-2xl font-medium">Sign in</h1>
      <div className="flex flex-col gap-2 mt-8">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          required
        />
        <button type="submit" className="mt-4 bg-blue-600 text-white p-2 rounded">
          Sign in
        </button>
        {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
      </div>
    </form>
  );
}
