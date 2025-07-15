// components/Layouts/appheader/LogoutButton.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "./dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { signOutAction } from "@/app/actions";

const LogoutButton: React.FC = () => {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      console.log("🚪 [LOGOUT] Starting logout process...");
      
      // Option 1: Use the client-side signOut from useAuth hook
      await signOut();
      
      // Option 2: Also call the server action to ensure cookies are cleared
      // This ensures complete cleanup on both client and server
      await signOutAction();
      
      console.log("🚪 [LOGOUT] Logout completed, redirecting...");
      
      // Force a hard navigation to ensure clean state
      window.location.href = "/sign-in";
      
    } catch (error) {
      console.error("🚪 [LOGOUT] Error during logout:", error);
      
      // Fallback: Force redirect even if there's an error
      window.location.href = "/sign-in";
    }
  };

  return (
    <DropdownMenuItem variant="danger" onSelect={handleLogout}>
      Log out
    </DropdownMenuItem>
  );
};

export default LogoutButton;