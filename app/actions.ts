"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { cookies } from "next/headers";
import { sendNotification } from "@/lib/notifications";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const inviteCode = formData.get("invite")?.toString();
  const supabase = await createClient();
  const headerList = headers();
  const origin = (await headerList).get("origin");

  if (!email || !password) {
    return encodedRedirect("error", "/sign-up", "Email and password are required.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback/oauth`,
      data: inviteCode ? { invite: inviteCode } : {},
    },
  });

  if (error || !data.user) {
    return encodedRedirect("error", "/sign-up", "Sign up failed.");
  }
  
  if (inviteCode) {
    const { data: inviteData, error: inviteError } = await supabase
      .from("invites")
      .select("role_id")
      .eq("code", inviteCode)
      .maybeSingle();
  
    if (!inviteError && inviteData?.role_id) {
      await supabase
        .from("profiles")
        .update({ 
          role: inviteData.role_id,
          avatar_url: "https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/avatars/Default.png" 
        })
        .eq("id", data.user.id);
  
      // ✅ Here you DELETE the invite after use
      await supabase
        .from("invites")
        .delete()
        .eq("code", inviteCode);
    }
  } else {
    // If no invite code, fetch and assign default user role from roles table
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("role", "user")
      .maybeSingle();
    
    if (!roleError && roleData?.id) {
      await supabase
        .from("profiles")
        .update({ 
          role: roleData.id,
          avatar_url: "https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/avatars/Default.png"
        })
        .eq("id", data.user.id);
    }
  }
  
  // Fetch the user's profile to get display_name for notification
  const { data: profileData } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", data.user.id)
    .single();

  // Send notification to admins about the new sign-up
  try {
    await sendNotification({
      title: `${profileData?.display_name || email} joined the team!`,
      subtitle: "Tell them welcome!",
      imageUrl: profileData?.avatar_url || "https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/avatars/Default.png",
      role_admin: true,
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
  
  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email to verify your account."
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  const store = await cookies();
  const allCookies = store.getAll();
  const lastPageCookie = allCookies.find((c) => c.name === "lastPage");

  let lastPage = lastPageCookie?.value || "/";

  if (["/sign-in", "/sign-up", "/forgot-password"].includes(lastPage)) {
    lastPage = "/";
  }

  return redirect(`${lastPage}?refresh=true`);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error("❌ Forgot password error:", error.message);
    return encodedRedirect("error", "/forgot-password", "Could not reset password");
  }

  if (callbackUrl) return redirect(callbackUrl);

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

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

export const signOutAction = async () => {
  const supabase = await createClient();
  const store = await cookies();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};