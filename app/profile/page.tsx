import { redirect } from "next/navigation";
import { getServerSession } from "@/app/auth/session";

export default async function ProfilePage() {
  const supabase = getServerSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="p-8 max-w-xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Your Profile</h1>
      <p className="text-gray-500">Welcome back, {user.email}!</p>

      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}
