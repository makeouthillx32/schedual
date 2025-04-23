"use client";

import React from "react";
import SignInButton from "@/components/ui/SignInButton";
import LogoutButton from "@/components/ui/LogoutButton";

interface MobileMenuProps {
  navigateTo: (page: string) => (e: React.MouseEvent) => void;
  session: any;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ navigateTo, session }) => (
  <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-[var(--home-dark)] shadow-md z-50 border-b border-gray-200">
    <div className="flex flex-col py-2">
      <a href="#" onClick={navigateTo("about")} className="px-4 py-2 hover:bg-gray-100">About Us</a>
      <a href="#" onClick={navigateTo("board")} className="px-4 py-2 hover:bg-gray-100">Board of Directors</a>
      <a href="#" onClick={navigateTo("title9")} className="px-4 py-2 hover:bg-gray-100">Title 9 Information</a>
      <a href="#" onClick={navigateTo("action")} className="px-4 py-2 hover:bg-gray-100">Autism Day Camp</a>
      <a href="#" onClick={navigateTo("jobs")} className="px-4 py-2 hover:bg-gray-100">Jobs</a>
      <div className="px-4 py-2">
        {!session && <SignInButton />}
        {session && <LogoutButton />}
      </div>
    </div>
  </div>
);

export default MobileMenu;
