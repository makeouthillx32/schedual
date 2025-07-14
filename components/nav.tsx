"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/app/provider";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "@/components/Layouts/appheader/dropdown-menu";

interface NavProps {
  pageTitle?: string;
}

const Nav: React.FC<NavProps> = ({ pageTitle }) => {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";
  const pathname = usePathname();
  
  // Check if we're on CMS route
  const isCMSRoute = pathname.startsWith('/CMS');

  return (
    <nav
      className={`flex justify-between items-center p-4 transition-colors ${
        isDark 
          ? "bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]" 
          : "bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]"
      } shadow-[var(--shadow-sm)]`}
    >
      <div className="flex items-center gap-3">
        {/* Logo */}
        <img
          src={
            themeType === "dark"
              ? "/images/home/dartlogowhite.svg"
              : "/images/home/dartlogo.svg"
          }
          alt="DART Logo"
          className="h-10 w-auto"
        />
        
        {/* App Title */}
        <h1 className="text-lg font-bold font-[var(--font-sans)]">
          {isCMSRoute ? (
            <>
              App CMS
              {pageTitle && <span className="ml-2 text-lg font-normal">{pageTitle}</span>}
            </>
          ) : pathname.startsWith('/Tools') ? (
            <>
              App Tools
              {pageTitle && <span className="ml-2 text-lg font-normal">{pageTitle}</span>}
            </>
          ) : (
            <>
              App
              {pageTitle && <span className="ml-2 text-lg font-normal">{pageTitle}</span>}
            </>
          )}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <SwitchtoDarkMode />
        {/* Dropdown menu */}
        <div className="relative z-10">
          <CustomDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Nav;