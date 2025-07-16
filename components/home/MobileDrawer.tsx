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
    /* Remove the backdrop completely - let the drawer handle everything */
    <div
      ref={menuRef}
      className={`drawer-content md:hidden
        ${isClosing ? "animate-slide-up" : "animate-slide-down"}`}
      style={{
        // Position directly under header with no overlap
        position: 'fixed',
        top: '4rem', // 64px - exactly below header
        left: 0,
        right: 0,
        zIndex: 50,
        maxHeight: 'calc(100vh - 4rem)',
        overflowY: 'auto',
        // Ensure no backdrop effects
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none'
      }}
    >
      <div className="mobile-menu-container bg-background border-b border-border shadow-lg rounded-b-xl">
        {navTree.map((node) => (
          <div key={node.key}>
            {/* Main category item - using primary color for distinction */}
            <div className="mobile-menu-item bg-primary/5 hover:bg-primary/10 border-b border-border/50 border-l-4 border-l-primary/30">
              <a
                href="#"
                onClick={handleClickAndClose(node.key)}
                className="menu-link focus:outline-none text-primary-foreground no-underline font-medium"
              >
                {node.label}
              </a>
              {node.children ? (
                <button
                  onClick={() => toggleExpand(node.key)}
                  className="menu-toggle text-primary-foreground hover:scale-110 transition-transform"
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
                  className="ml-2 text-primary/60"
                />
              )}
            </div>

            {/* Submenu items - using muted colors for distinction */}
            {node.children && expanded === node.key && (
              <div className="mobile-submenu bg-muted/30 border-l-2 border-muted/40">
                {node.children.map((child) => (
                  <a
                    key={child.key}
                    href="#"
                    onClick={handleClickAndClose(child.key)}
                    className="submenu-link text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-l-primary/40 hover:pl-9 no-underline pl-8 py-3 block border-l-2 border-l-transparent transition-all duration-200"
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="mobile-auth-section border-t-2 border-border bg-background pt-3 mt-2">
          {!session ? (
            <a
              href="/sign-in"
              onClick={handleClose}
              className="auth-button text-accent-foreground bg-accent/10 hover:bg-accent/20 hover:-translate-y-0.5 no-underline font-medium rounded-md mx-1 my-1 w-[calc(100%-0.5rem)] block transition-all duration-200"
            >
              Sign In
            </a>
          ) : (
            <button
              onClick={() => {
                window.location.href = "/auth/logout";
                handleClose();
              }}
              className="auth-button text-destructive-foreground bg-destructive/10 hover:bg-destructive/20 hover:-translate-y-0.5 font-medium rounded-md mx-1 my-1 w-[calc(100%-0.5rem)] transition-all duration-200"
            >
              Log Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}