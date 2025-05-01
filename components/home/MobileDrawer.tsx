"use client";

import React, { useState, useRef, useEffect } from "react";
import { navTree } from "@/lib/navTree";

interface DesktopNavProps {
  navigateTo: (key: string) => (e?: React.MouseEvent) => void;
}

export default function DesktopNav({ navigateTo }: DesktopNavProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <nav className="hidden md:flex items-center gap-8 nav-root relative z-50">
      {navTree.map((node) => (
        <div
          key={node.key}
          className="relative group"
          onMouseEnter={() => setOpenKey(node.key)}
          onMouseLeave={() => setOpenKey(null)}
        >
          {node.children ? (
            <>
              <button
                className="nav-top-link"
                onClick={navigateTo(node.key)}
                data-state={openKey === node.key ? "open" : undefined}
              >
                {node.label}
              </button>
              <div
                className={`nav-dropdown ${openKey === node.key ? "block" : "hidden"}`}
                data-state={openKey === node.key ? "open" : undefined}
              >
                <ul className="grid gap-1 min-w-[14rem]">
                  <li key={`${node.key}-parent`}>
                    <a
                      href={`#${node.key}`}
                      onClick={navigateTo(node.key)}
                      className="nav-sub-link font-semibold"
                    >
                      {node.label}
                    </a>
                  </li>
                  {node.children.map((child) => (
                    <li key={child.key}>
                      <a
                        href={`#${child.key}`}
                        onClick={navigateTo(child.key)}
                        className="nav-sub-link"
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
            >
              {node.label}
            </a>
          )}
        </div>
      ))}
    </nav>
  );
}
