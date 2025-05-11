"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MdExpandMore,
  MdChevronRight,
  MdArrowForwardIos,
} from "react-icons/md";
import { navTree } from "@/lib/navTree";

interface MobileDrawerProps {
  navigateTo: (id: string) => (e?: React.MouseEvent<HTMLAnchorElement>) => void;
  session: any;
  onClose: () => void;
}

export default function MobileDrawer({
  navigateTo,
  session,
  onClose,
}: MobileDrawerProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => (prev === key ? null : key));
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250); // must match animation duration
  };

  const handleClickAndClose = (key: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    navigateTo(key)(e);
    handleClose();
  };

  return (
    <div
      ref={menuRef}
      className={`md:hidden absolute top-full left-0 right-0 z-40 bg-[var(--home-header)]
        shadow-md border-b border-gray-200 rounded-b-xl overflow-hidden
        ${isClosing ? "animate-slide-up" : "animate-slide-down"}`}
    >
      <div className="flex flex-col py-1 gap-[2px]">
        {navTree.map((node) => (
          <div key={node.key}>
            <div className="flex items-center justify-between px-4 py-1.5 text-sm text-[var(--home-text)] hover:bg-[var(--home-background)] transition-colors">
              <a
                href="#"
                onClick={handleClickAndClose(node.key)}
                className="truncate w-full focus:outline-none"
              >
                {node.label}
              </a>
              {node.children ? (
                <button
                  onClick={() => toggleExpand(node.key)}
                  className="pl-2 text-[var(--home-text)]"
                  aria-label={`Toggle ${node.label}`}
                >
                  {expanded === node.key ? (
                    <MdExpandMore size={20} />
                  ) : (
                    <MdChevronRight size={20} />
                  )}
                </button>
              ) : (
                <MdArrowForwardIos
                  size={14}
                  className="ml-2 text-[var(--home-light)]"
                />
              )}
            </div>

            {node.children && expanded === node.key && (
              <div className="pl-4 flex flex-col overflow-hidden transition-all duration-200">
                {node.children.map((child) => (
                  <a
                    key={child.key}
                    href="#"
                    onClick={handleClickAndClose(child.key)}
                    className="px-4 py-1.5 text-sm text-[var(--home-text)] hover:bg-[var(--home-background)] transition-colors"
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="mt-1 border-t pt-2">
          {!session ? (
            <a
              href="/sign-in"
              onClick={handleClose}
              className="px-4 py-1.5 text-sm text-[var(--home-accent)] font-semibold block hover:bg-[var(--home-background)]"
            >
              Sign In
            </a>
          ) : (
            <button
              onClick={() => {
                window.location.href = "/auth/logout";
                handleClose();
              }}
              className="px-4 py-1.5 text-sm text-[var(--home-danger)] font-semibold block w-full text-left hover:bg-[var(--home-background)]"
            >
              Log Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}