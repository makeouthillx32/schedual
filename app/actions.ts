"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { encodedRedirect } from "@/utils/utils"
import { cookies } from "next/headers"

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString()
  const password = formData.get("password")?.toString()
  const supabase = await createClient()
  const headerList = headers()
  const origin = (await headerList).get("origin")

  if (!email || !password) {
    return encodedRedirect("error", "/sign-up", "Email and password are required.")
  }

  // Extract invite code from the current URL (from cookie or headers if needed)
  const inviteCode = formData.get("invite")?.toString()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback/oauth`,
    },
  })

  if (error || !data.user) {
    return encodedRedirect("error", "/sign-up", "Sign up failed.")
  }

  // If there's an invite code, update the user's role in the profile
  if (inviteCode) {
    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .select("role")
      .eq("code", inviteCode)
      .single()

    if (!inviteError && invite?.role) {
      await supabase.from("profiles").update({ role: invite.role }).eq("id", data.user.id)
      await supabase.from("invites").delete().eq("code", inviteCode)
    }
  }

  // Set default display_name from email
  if (data.user) {
    // Check if display_name exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", data.user.id)
      .single()

    // If profile exists but has no display_name, update it
    if (!profileError && !profile?.display_name) {
      // Create default name from email before @
      const defaultName = email.split("@")[0]

      if (defaultName) {
        await supabase.from("profiles").update({ display_name: defaultName }).eq("id", data.user.id)
      }
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email to verify your account.",
  )
}
export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message)
  }

  // Get last visited page from cookies
  const store = await cookies()
  const allCookies = store.getAll()
  const lastPageCookie = allCookies.find((c) => c.name === "lastPage")

  let lastPage = lastPageCookie?.value || "/CMS"

  // Prevent redirecting back to auth pages
  if (["/sign-in", "/sign-up", "/forgot-password"].includes(lastPage)) {
    lastPage = "/CMS"
  }

  return redirect(`${lastPage}?refresh=true`)
}

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString()
  const supabase = await createClient() // ✅ FIXED
  const origin = (await headers()).get("origin")
  const callbackUrl = formData.get("callbackUrl")?.toString()

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required")
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  })

  if (error) {
    console.error("❌ Forgot password error:", error.message)
    return encodedRedirect("error", "/forgot-password", "Could not reset password")
  }

  if (callbackUrl) return redirect(callbackUrl)

  return encodedRedirect("success", "/forgot-password", "Check your email for a link to reset your password.")
}

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient() // ✅ FIXED
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!password || !confirmPassword) {
    return encodedRedirect("error", "/protected/reset-password", "Password and confirm password are required")
  }

  if (password !== confirmPassword) {
    return encodedRedirect("error", "/protected/reset-password", "Passwords do not match")
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return encodedRedirect("error", "/protected/reset-password", "Password update failed")
  }

  return encodedRedirect("success", "/protected/reset-password", "Password updated")
}

export const signOutAction = async () => {
  const supabase = await createClient() // ✅ FIXED
  await supabase.auth.signOut()
  return redirect("/sign-in")
}
