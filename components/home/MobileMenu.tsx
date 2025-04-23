"use client";

import React from "react";
import SignInButton from "@/components/ui/SignInButton";
import LogoutButton from "@/components/ui/LogoutButton";
import { navLinks } from "@/components/home/navLinks";

interface MobileMenuProps {
  navigateTo: (page: string) => (e: React.MouseEvent<HTMLAnchorElement>) => void;
  session: any;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ navigateTo, session }) => (
  <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-[var(--home-dark)] shadow-md z-50 border-b border-gray-200">
    <div className="flex flex-col py-2">
      {navLinks.map((link) => (
        <a
          key={link.key}
          href="#"
          onClick={navigateTo(link.key)}
          className="px-4 py-2 hover:bg-gray-100"
        >
          {link.label}
        </a>
      ))}
      <div className="px-4 py-2">
        {!session && <SignInButton />}
        {session && <LogoutButton />}
      </div>
    </div>
  </div>
);

export default MobileMenu;
