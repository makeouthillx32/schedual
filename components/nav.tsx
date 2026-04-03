"use client";

import React from "react";
import { useTheme } from "@/app/provider";
import Link from "next/link";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "@/components/Layouts/appheader/dropdown-menu";
import { Notification } from "@/components/Layouts/header/notification";
import PushPermissionBanner from "@/components/PushPermissionBanner";

interface NavProps {
  pageTitle?: string;
}

const Nav: React.FC<NavProps> = ({ pageTitle }) => {
  const { themeType } = useTheme();

  return (
    <nav
      data-layout="app"
      className="flex justify-between items-center px-4 py-3 transition-colors gap-2 bg-[var(--lt-bg)] text-[var(--lt-fg)] shadow-[var(--lt-shadow)]"
    >
      {/* Left: logo + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
          <img
            src={
              themeType === "dark"
                ? "/images/home/dartlogowhite.svg"
                : "/images/home/dartlogo.svg"
            }
            alt="DART Logo"
            className="h-10 w-auto cursor-pointer"
          />
        </Link>
        {pageTitle && (
          <h1 className="text-lg font-medium font-[var(--font-sans)] truncate">
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Right: push banner + notification bell + theme toggle + menu */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Push permission banner — only visible when not yet subscribed */}
        <PushPermissionBanner />

        {/* Notification bell — messages only on app pages */}
        <Notification messagesOnly />

        {/* Theme toggle */}
        <SwitchtoDarkMode />

        {/* Hamburger dropdown */}
        <div className="relative z-10">
          <CustomDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Nav;