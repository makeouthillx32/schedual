"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTheme } from "@/app/provider"; // Make sure your provider exports useTheme
import SwitchtoDarkMode from "@/components/SwitchtoDarkMode";
import useLoginSession from "@/lib/useLoginSession";
import MobileDrawer from "@/components/home/MobileDrawer";
import DesktopNav from "@/components/home/DesktopNav";

interface HeaderProps {
  navigateTo: (page: string) => (e?: React.MouseEvent) => void;
}
const Header: React.FC<HeaderProps> = ({ navigateTo }) => {
  const session = useLoginSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { themeType } = useTheme(); // get live theme from context

  return (
    <header className="border-b border-gray-200 py-2 px-4 relative bg-[var(--home-header)] text-[var(--home-header-text)]">
      <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap items-center justify-between gap-y-2">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <a href="#" onClick={navigateTo("home")} className="flex items-center">
            <img
              src={
                themeType === "dark"
                  ? "/images/home/dartlogowhite.svg"
                  : "/images/home/dartlogo.svg"
              }
              alt="DART Logo"
              className="h-12 w-auto max-w-none"
            />
          </a>
        </div>

        {/* Center: Desktop Nav */}
        <div className="flex-1 min-w-0 hidden md:flex items-center justify-center overflow-visible">
          <DesktopNav navigateTo={navigateTo} />
        </div>

        {/* Right: Auth + Dark mode + Hamburger */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {!session ? (
              <a
                href="/sign-in"
                className="auth-link text-[var(--home-accent)] font-semibold whitespace-nowrap"
              >
                Sign In
              </a>
            ) : (
              <button
                onClick={() => (window.location.href = "/auth/logout")}
                className="auth-link text-[var(--home-danger)] font-semibold whitespace-nowrap"
              >
                Log Out
              </button>
            )}
          </div>

          <SwitchtoDarkMode />

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <MobileDrawer
          navigateTo={navigateTo}
          session={session}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
