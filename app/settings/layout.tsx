/* app/settings/layout.tsx
   ─────────────────────── */

import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { Providers } from "@/app/provider";

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Fetch the current session on the server
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Only wrap children – Nav / Footer still come from the root layout
  return <Providers session={session}>{children}</Providers>;
}
