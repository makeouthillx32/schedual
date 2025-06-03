"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MdExpandMore,
  MdChevronRight,
  MdArrowForwardIos,
} from "react-icons/md";
import { navTree } from "@/lib/navTree";
import "./_components/Mobile.scss";

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
    }, 250);
  };

  const handleClickAndClose = (key: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    navigateTo(key)(e);
    handleClose();
  };

  return (
    <>
      {/* Backdrop that only covers content below header */}
      <div 
        className="md:hidden fixed inset-0 top-16 bg-black/20 z-40"
        onClick={handleClose}
      />
      
      {/* Drawer positioned relative to header, not overlapping it */}
      <div
        ref={menuRef}
        className={`md:hidden fixed top-16 left-0 right-0 z-50 
          bg-background border-b border-border shadow-lg rounded-b-xl overflow-hidden
          ${isClosing ? "animate-slide-up" : "animate-slide-down"}`}
        style={{
          maxHeight: 'calc(100vh - 4rem)', // Ensure it doesn't exceed viewport
          overflowY: 'auto'
        }}
      >
        <div className="flex flex-col py-1 gap-[2px] bg-background">
          {navTree.map((node) => (
            <div key={node.key}>
              <div className="flex items-center justify-between px-4 py-1.5 text-sm text-foreground hover:bg-secondary transition-colors">
                <a
                  href="#"
                  onClick={handleClickAndClose(node.key)}
                  className="truncate w-full focus:outline-none text-foreground no-underline"
                >
                  {node.label}
                </a>
                {node.children ? (
                  <button
                    onClick={() => toggleExpand(node.key)}
                    className="pl-2 text-foreground bg-transparent border-none cursor-pointer"
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
                    className="ml-2 text-muted-foreground"
                  />
                )}
              </div>

              {node.children && expanded === node.key && (
                <div className="pl-4 flex flex-col overflow-hidden transition-all duration-200 bg-background">
                  {node.children.map((child) => (
                    <a
                      key={child.key}
                      href="#"
                      onClick={handleClickAndClose(child.key)}
                      className="px-4 py-1.5 text-sm text-foreground hover:bg-secondary transition-colors no-underline"
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="mt-1 border-t border-border pt-2 bg-background">
            {!session ? (
              <a
                href="/sign-in"
                onClick={handleClose}
                className="px-4 py-1.5 text-sm text-accent font-semibold block hover:bg-secondary transition-colors no-underline"
              >
                Sign In
              </a>
            ) : (
              <button
                onClick={() => {
                  window.location.href = "/auth/logout";
                  handleClose();
                }}
                className="px-4 py-1.5 text-sm text-destructive font-semibold block w-full text-left hover:bg-secondary bg-transparent border-none cursor-pointer transition-colors"
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}