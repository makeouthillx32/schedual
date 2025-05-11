"use client";

import React, { useState, useRef, useEffect } from "react";
import { navTree } from "@/components/home/_components/navTree";

interface DesktopNavProps {
  navigateTo: (key: string) => (e?: React.MouseEvent) => void;
}

export default function DesktopNav({ navigateTo }: DesktopNavProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const navRefs = useRef<(HTMLElement | null)[]>([]);
  
  // Track whether the mouse is currently over the menu
  const [isMouseOver, setIsMouseOver] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openKey && !navRefs.current.some(ref => ref?.contains(event.target as Node))) {
        setOpenKey(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openKey]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (openKey === navTree[index].key) {
          // Focus first dropdown item
          const dropdownItems = document.querySelectorAll(`[data-parent="${navTree[index].key}"] a`);
          if (dropdownItems.length > 0) {
            (dropdownItems[0] as HTMLElement).focus();
          }
        } else {
          // Open dropdown
          setOpenKey(navTree[index].key);
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        const nextIndex = index < navTree.length - 1 ? index + 1 : 0;
        navRefs.current[nextIndex]?.focus();
        setFocusedIndex(nextIndex);
        break;
      case "ArrowLeft":
        e.preventDefault();
        const prevIndex = index > 0 ? index - 1 : navTree.length - 1;
        navRefs.current[prevIndex]?.focus();
        setFocusedIndex(prevIndex);
        break;
      case "Escape":
        e.preventDefault();
        setOpenKey(null);
        break;
      case "Enter":
      case " ":
        if (navTree[index].children) {
          e.preventDefault();
          setOpenKey(openKey === navTree[index].key ? null : navTree[index].key);
        }
        break;
    }
  };

  // Handle keyboard navigation within dropdown
  const handleSubmenuKeyDown = (e: React.KeyboardEvent, parentKey: string, childIndex: number) => {
    const parentIndex = navTree.findIndex(node => node.key === parentKey);
    const childItems = navTree[parentIndex].children || [];
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (childIndex < childItems.length - 1) {  // Adjusted to account for 0-based indexing
          const nextChildItem = document.querySelector(`[data-parent="${parentKey}"] [data-index="${childIndex + 1}"] a`) as HTMLElement;
          nextChildItem?.focus();
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (childIndex > 0) {
          const prevChildItem = document.querySelector(`[data-parent="${parentKey}"] [data-index="${childIndex - 1}"] a`) as HTMLElement;
          prevChildItem?.focus();
        } else {
          // Focus back on parent menu item
          navRefs.current[parentIndex]?.focus();
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpenKey(null);
        navRefs.current[parentIndex]?.focus();
        break;
    }
  };

  // Create a small delay before closing the dropdown
  // This helps prevent accidental closing when moving from button to dropdown
  const handleMouseLeave = (key: string) => {
    setIsMouseOver(false);
    
    // Small delay before closing the dropdown
    setTimeout(() => {
      if (!isMouseOver && openKey === key) {
        setOpenKey(null);
      }
    }, 100);
  };

  return (
    <nav className="hidden md:flex items-center gap-8 nav-root relative z-50">
      {navTree.map((node, index) => (
        <div
          key={node.key}
          className="relative group"
          onMouseEnter={() => {
            setOpenKey(node.key);
            setIsMouseOver(true);
          }}
          onMouseLeave={() => handleMouseLeave(node.key)}
          ref={el => {
            navRefs.current[index] = el;
          }}
        >
          {node.children ? (
            <>
              <button
                className="nav-top-link"
                onClick={navigateTo(node.key)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-expanded={openKey === node.key}
                aria-haspopup="true"
                ref={el => {
                  navRefs.current[index] = el;
                }}
                tabIndex={0}
                data-state={openKey === node.key ? "open" : "closed"}
              >
                {node.label}
              </button>
              <div
                className="nav-dropdown"
                data-state={openKey === node.key ? "open" : "closed"}
                data-parent={node.key}
                role="menu"
                aria-label={`${node.label} submenu`}
              >
                <ul className="grid gap-1 min-w-[14rem]">
                  {/* Removed redundant parent item */}
                  {node.children.map((child, childIndex) => (
                    <li key={child.key} data-index={childIndex}>
                      <a
                        href={`#${child.key}`}
                        onClick={(e) => {
                          navigateTo(child.key)(e);
                          setOpenKey(null);
                        }}
                        className="nav-sub-link"
                        onKeyDown={(e) => handleSubmenuKeyDown(e, node.key, childIndex)}
                        role="menuitem"
                        tabIndex={openKey === node.key ? 0 : -1}
                      >
                        {child.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <a
              href={`#${node.key}`}
              onClick={navigateTo(node.key)}
              className="nav-top-link"
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={el => {
                navRefs.current[index] = el;
              }}
              tabIndex={0}
            >
              {node.label}
            </a>
          )}
        </div>
      ))}
    </nav>
  );
}