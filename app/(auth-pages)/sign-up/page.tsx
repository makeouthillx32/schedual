import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SignInWithGoogle from "@/components/ui/SignInWithGoogle";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { Mail, Lock } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  const cookieData = await cookies();
  const invite = cookieData.get("invite")?.value;
  const lastPage = cookieData.get("lastPage")?.value;

  if ("message" in searchParams && searchParams.message.includes("Thanks for signing up") && lastPage) {
    return redirect(`${lastPage}?refresh=true`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-800 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Create account</h1>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="text-primary font-medium hover:underline transition-all" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>

        <div className="space-y-4">
          <SignInWithGoogle />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-zinc-600"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-800 px-2 text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          <form className="space-y-4" action={signUpAction}>
            <input type="hidden" name="invite" value={invite || ""} />

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <Input 
                  name="email" 
                  id="email"
                  placeholder="you@example.com" 
                  required
                  className="pl-10" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <Input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <SubmitButton 
              pendingText="Creating account..."
              className="w-full py-2.5 rounded-lg font-medium bg-primary hover:bg-primary/90 transition-colors"
            >
              Create account
            </SubmitButton>

            <FormMessage message={searchParams} />
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>
          </p>
        </div>
      </div>

      <SmtpMessage />
    </div>
  );
}
