"use client";

import React from "react";
import { Menu, X } from "lucide-react";
import SwitchtoDarkMode from "@/components/SwitchtoDarkMode";
import { navLinks } from "@/components/home/navLinks";

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
}) => (
  <header
    className="border-b border-gray-200 py-2 px-4 relative"
    style={{ backgroundColor: "var(--home-nav-bg)", color: "var(--home-nav-text)" }}
  >
    <div className="max-w-7xl mx-auto flex justify-between items-center">
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
      <div className="flex items-center space-x-4">
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          {navLinks.map((link) => (
            <a
              key={link.key}
              href="#"
              onClick={navigateTo(link.key)}
              className="hover:underline"
            >
              {link.label}
            </a>
          ))}
        </nav>
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

export default Header;
