"use client";

import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SignInWithGoogle from "@/components/ui/SignInWithGoogle";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { useSearchParams } from "next/navigation";

export default function SignupWrapper() {
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");

  return <Signup invite={invite} />;
}

function Signup({ invite }: { invite: string | null }) {
  return (
    <>
      <form className="flex flex-col min-w-64 max-w-64 mx-auto">
        <h1 className="text-2xl font-medium">Sign up</h1>
        <p className="text-sm text text-foreground">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>

        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />

          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />

          {invite && (
            <input type="hidden" name="invite" value={invite} />
          )}

          <SubmitButton formAction={signUpAction} pendingText="Signing up...">
            Sign up
          </SubmitButton>

          <FormMessage message={{}} />
        </div>
      </form>

      <SmtpMessage />

      <div className="mt-6 flex justify-center">
        <SignInWithGoogle />
      </div>
    </>
  );
}