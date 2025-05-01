"use client";

import React, { useEffect, useRef } from "react";
import { navTree } from "@/lib/navTree";

interface MobileDrawerProps {
  navigateTo: (key: string) => (e?: React.MouseEvent) => void;
  session: any;
  onClose: () => void;
}

export default function MobileDrawer({ navigateTo, session, onClose }: MobileDrawerProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="md:hidden absolute top-16 left-0 right-0 bg-[var(--home-background)] shadow-md z-50 border-b border-gray-200 rounded-b-xl animate-fade-in"
    >
      <div className="flex flex-col py-2">
        {navTree.map((link) => {
          if (link.key === "logout") {
            return session ? (
              <button
                key="logout"
                onClick={() => (window.location.href = "/auth/logout")}
                className="px-4 py-2 hover:bg-[var(--home-nav-bg)] text-left text-[var(--home-danger)] font-semibold"
              >
                Log Out
              </button>
            ) : null;
          }

          if (link.key === "sign-in") {
            return !session ? (
              <a
                key="sign-in"
                href="/sign-in"
                className="px-4 py-2 hover:bg-[var(--home-nav-bg)] text-[var(--home-accent)] font-semibold"
              >
                Sign In
              </a>
            ) : null;
          }

          return (
            <a
              key={link.key}
              href={`#${link.key}`}
              onClick={navigateTo(link.key)}
              className="px-4 py-2 hover:bg-[var(--home-nav-bg)] text-[var(--home-text)]"
            >
              {link.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
