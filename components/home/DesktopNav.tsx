"use client";

import React, { useState, useRef, useEffect } from "react";
import { navTree } from "@/lib/navTree";
import "./_components/Desktop.scss";

interface DesktopNavProps {
  navigateTo: (key: string) => (e?: React.MouseEvent) => void;
}

export default function DesktopNav({ navigateTo }: DesktopNavProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const navRefs = useRef<(HTMLElement | null)[]>([]);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const [isMouseOver, setIsMouseOver] = useState(false);

  // Smart dropdown positioning
  const getDropdownAlignment = (index: number) => {
    if (typeof window === 'undefined') return 'dropdown-align-center';
    
    const navItem = navRefs.current[index];
    if (!navItem) return 'dropdown-align-center';
    
    const rect = navItem.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    // If we're close to the right edge, right-align
    if (rect.right > viewportWidth - 200) {
      return 'dropdown-align-right';
    }
    
    // If we're close to the left edge, left-align
    if (rect.left < 200) {
      return 'dropdown-align-left';
    }
    
    // Otherwise, center-align
    return 'dropdown-align-center';
  };

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

  // Reposition dropdown when window resizes
  useEffect(() => {
    const handleResize = () => {
      // Force re-render to recalculate dropdown positions
      if (openKey) {
        const currentOpenKey = openKey;
        setOpenKey(null);
        setTimeout(() => setOpenKey(currentOpenKey), 10);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [openKey]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (openKey === navTree[index].key) {
          const dropdownItems = document.querySelectorAll(`[data-parent="${navTree[index].key}"] a`);
          if (dropdownItems.length > 0) {
            (dropdownItems[0] as HTMLElement).focus();
          }
        } else {
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

  const handleSubmenuKeyDown = (e: React.KeyboardEvent, parentKey: string, childIndex: number) => {
    const parentIndex = navTree.findIndex(node => node.key === parentKey);
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (childIndex < (navTree[parentIndex].children || []).length - 1) {
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

  const handleMouseLeave = (key: string) => {
    setIsMouseOver(false);
    setTimeout(() => {
      if (!isMouseOver && openKey === key) {
        setOpenKey(null);
      }
    }, 100);
  };

  return (
    <nav className="nav-container">
      <div className="nav-menu">
        {navTree.map((node, index) => (
          <div
            key={node.key}
            className="nav-item"
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
                  className="nav-top-link text-foreground hover:text-foreground bg-transparent border-none cursor-pointer"
                  onClick={navigateTo(node.key)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  aria-expanded={openKey === node.key}
                  aria-haspopup="true"
                  tabIndex={0}
                  data-state={openKey === node.key ? "open" : "closed"}
                >
                  {node.label}
                </button>
                <div
                  ref={el => {
                    dropdownRefs.current[index] = el;
                  }}
                  className={`nav-dropdown bg-background border border-border ${getDropdownAlignment(index)} ${
                    openKey === node.key ? "block" : "hidden"
                  }`}
                  data-state={openKey === node.key ? "open" : "closed"}
                  data-parent={node.key}
                  role="menu"
                  aria-label={`${node.label} submenu`}
                >
                  <ul className="grid gap-1 min-w-[14rem]">
                    {node.children.map((child, childIndex) => (
                      <li key={child.key} data-index={childIndex}>
                        <a
                          href={`#${child.key}`}
                          onClick={(e) => {
                            navigateTo(child.key)(e);
                            setOpenKey(null);
                          }}
                          className="nav-sub-link text-foreground hover:bg-secondary no-underline"
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
                className="nav-top-link text-foreground hover:text-foreground no-underline"
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
      </div>
    </nav>
  );
}