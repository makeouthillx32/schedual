"use client";

import React from "react";
import { Menu, X } from "lucide-react";
import SwitchtoDarkMode from "@/components/SwitchtoDarkMode";
import { navLinks } from "@/components/home/navLinks";
import useLoginSession from "@/lib/useLoginSession";

interface HeaderProps {
  theme: "light" | "dark";
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  navigateTo: (page: string) => (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const Header: React.FC<HeaderProps> = ({
  theme,
  mobileMenuOpen,
  setMobileMenuOpen,
  navigateTo,
}) => {
  const session = useLoginSession();

  const filteredNavLinks = navLinks.filter(
    (link) => link.key !== "sign-in" && link.key !== "logout"
  );

  return (
    <header className="border-b border-gray-200 py-2 px-4 relative bg-[var(--home-header)] text-[var(--home-header-text)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="font-bold text-lg">
          <a href="#" onClick={navigateTo("home")} className="flex items-center">
            <img
              src={theme === "dark" ? "/images/home/dartlogowhite.svg" : "/images/home/dartlogo.svg"}
              alt="DART Logo"
              width={80}
              height={80}
              className="h-12 w-auto"
            />
          </a>
        </div>
        <div className="flex-1 hidden md:flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm min-w-0 overflow-hidden text-ellipsis">
          {filteredNavLinks.map((link) => (
            <a
              key={link.key}
              href="#"
              onClick={navigateTo(link.key)}
              className="hover:underline text-[var(--home-nav-text)] truncate"
            >
              {link.label}
            </a>
          ))}

          {/* Auth buttons - only visible on desktop */}
          {!session ? (
            <a
              href="/sign-in"
              className="text-[var(--home-accent)] text-sm font-semibold hover:underline truncate"
            >
              Sign In
            </a>
          ) : (
            <button
              onClick={() => (window.location.href = "/auth/logout")}
              className="text-[var(--home-danger)] text-sm font-semibold hover:underline truncate"
            >
              Log Out
            </button>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <SwitchtoDarkMode />
          <button
            className="md:hidden p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
