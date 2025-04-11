import dynamic from "next/dynamic";

const SignInForm = dynamic(() => import("@/components/SignInForm"), { ssr: false });

export default function SignInPage() {
  return <SignInForm />;
}
