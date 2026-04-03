"use client";

import Link from "next/link";
import { useTheme } from "@/app/provider";
import SwitchtoDarkMode from "@/components/SwitchtoDarkMode";
import { CustomDropdown } from "@/components/CustomDropdown";
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

      <div className="flex items-center gap-2 shrink-0">
        <PushPermissionBanner />
        <Notification messagesOnly />
        <SwitchtoDarkMode />
        <div className="relative z-10">
          <CustomDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Nav;