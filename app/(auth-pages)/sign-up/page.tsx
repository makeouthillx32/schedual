import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/Layouts/appheader/input";
import { Label } from "@/components/ui/label";
import SignInWithGoogle from "@/components/ui/SignInWithGoogle";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { cookies } from "next/headers";
import type { Metadata } from "next";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ invite?: string; role?: string }> }): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const role = resolvedSearchParams?.role || "client";

  const roleName = {
    admin: "Admin",
    job_coach: "Job Coach",
    client: "Client",
    anonymous: "User"
  }[role] || "User";

  return {
    title: `Invite to join as ${roleName}`,
    description: `You've been invited to join as a ${roleName} on the CMS Schedule App.`,
    openGraph: {
      title: `Join as a ${roleName}`,
      description: `Create an account and get started as a ${roleName} on the CMS Schedule App.`,
      images: [`/images/${role}.png`]
    },
    twitter: {
      card: "summary_large_image",
      title: `Join as a ${roleName}`,
      description: `You've been invited to create an account as a ${roleName}.`,
      images: [`/images/${role}.png`]
    }
  };
}

export default async function Signup({ searchParams }: { searchParams: Promise<Message> }) {
  const resolvedSearchParams = await searchParams;
  const cookieData = await cookies();
  const invite = cookieData.get("invite")?.value;

  if ("message" in resolvedSearchParams) {
    return (
      <div className="w-full flex-1 flex items-center min-h-screen justify-center gap-2 p-4">
        <FormMessage message={resolvedSearchParams} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 px-4 md:px-6 lg:px-12">
      <div className="mx-auto w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-800 shadow-2xl p-10">
        <h1 className="text-4xl font-extrabold text-center text-primary dark:text-white mb-6">Create an Account</h1>

        <SignInWithGoogle />

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300 dark:border-zinc-600"></div>
          <span className="mx-4 text-sm text-muted-foreground">OR</span>
          <div className="flex-grow border-t border-gray-300 dark:border-zinc-600"></div>
        </div>

        <form className="space-y-6" action={signUpAction}>
          <input type="hidden" name="invite" value={invite || ""} />

          <div>
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={18} />
              </span>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </span>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                minLength={6}
                required
                className="pl-10"
              />
            </div>
          </div>

          <SubmitButton
            pendingText="Creating..."
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold"
          >
            Create Account
          </SubmitButton>

          <FormMessage message={resolvedSearchParams} />
        </form>

        <p className="text-center text-sm mt-6 text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-blue-600 dark:text-blue-400 hover:underline">
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-primary">Terms</Link> and{' '}
          <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}