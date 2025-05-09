// app/actions.ts – full restored file with notification support

"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { cookies } from "next/headers";
import { sendNotification } from "@/lib/notifications"; // 🆕 helper we added


//--------------------------------------------------------------
// SIGN‑UP ACTION
//--------------------------------------------------------------
export const signUpAction = async (formData: FormData): Promise<void> => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const inviteCode = formData.get("invite")?.toString();

  if (!email || !password) {
    return encodedRedirect("error", "/sign-up", "Email and password are required.");
  }

  const supabase = await createClient();
  const origin = headers().get("origin");

  // ── 1. create auth user ────────────────────────────────────
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback/oauth`,
      data: inviteCode ? { invite: inviteCode } : {},
    },
  });

  if (authError || !authData.user) {
    return encodedRedirect("error", "/sign-up", authError?.message || "Sign‑up failed.");
  }

  const userId = authData.user.id;

  // ── 2. apply role based on invite OR fallback to default ──
  let assignedRoleId: string | null = null;

  if (inviteCode) {
    const { data: inviteData, error: inviteError } = await supabase
      .from("invites")
      .select("role_id")
      .eq("code", inviteCode)
      .maybeSingle();

    if (!inviteError && inviteData?.role_id) {
      assignedRoleId = inviteData.role_id;
      await supabase.from("profiles").update({ role: assignedRoleId }).eq("id", userId);
      await supabase.from("invites").delete().eq("code", inviteCode);
    }
  }

  // 👉 If NO invite we set the default “anonymous / user” role (user0x)
  if (!assignedRoleId) {
    assignedRoleId = "user0x"; // default role ID for vanilla sign‑ups
    await supabase.from("profiles").update({ role: assignedRoleId }).eq("id", userId);
  }

  // ── 3. fetch profile display name & avatar ────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", userId)
    .single();

  // ── 4. send admin notification that a user joined ─────────
  try {
    await sendNotification({
      title: `${profile?.display_name || email} Joined the Team!`,
      subtitle: "Congratulate them",
      senderId: userId,
      imageUrl:
        profile?.avatar_url ||
        "https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/avatars/Default.png",
      roles: { admin: true }, // only admins see it
    });
  } catch (err) {
    console.error("Failed to send join notification", err);
  }

  // ── 5. success redirect message ───────────────────────────
  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email to verify your account."
  );
};

//--------------------------------------------------------------
// SIGN‑IN ACTION (unchanged)
//--------------------------------------------------------------
export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  const store = await cookies();
  const lastPage = store.get("lastPage")?.value || "/";
  if (["/sign-in", "/sign-up", "/forgot-password"].includes(lastPage)) {
    return redirect("/");
  }

  return redirect(`${lastPage}?refresh=true`);
};

//--------------------------------------------------------------
// FORGOT PASSWORD ACTION (unchanged)
//--------------------------------------------------------------
export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = headers().get("origin");

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    return encodedRedirect("error", "/forgot-password", "Could not reset password");
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

//--------------------------------------------------------------
// RESET PASSWORD ACTION (unchanged)
//--------------------------------------------------------------
export const resetPasswordAction = async (formData: FormData) => {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const supabase = await createClient();

  if (!password || !confirmPassword) {
    return encodedRedirect("error", "/protected/reset-password", "Password and confirm password are required");
  }
  if (password !== confirmPassword) {
    return encodedRedirect("error", "/protected/reset-password", "Passwords do not match");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return encodedRedirect("error", "/protected/reset-password", "Password update failed");
  }

  return encodedRedirect("success", "/protected/reset-password", "Password updated");
};

//--------------------------------------------------------------
// SIGN‑OUT ACTION (unchanged)
//--------------------------------------------------------------
export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
