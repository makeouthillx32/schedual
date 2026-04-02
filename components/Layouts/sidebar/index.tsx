"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";

export function Sidebar() {
  const pathname = usePathname();
  const { id } = useParams() as { id: string };
  const base = `/dashboard/${id}`;

  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));
  };

  useEffect(() => {
    NAV_DATA.some((section) =>
      section.items.some((item) =>
        item.items.some((subItem) => {
          if (`${base}${subItem.url}` === pathname) {
            if (!expandedItems.includes(item.title)) {
              toggleExpanded(item.title);
            }
            return true;
          }
          return false;
        })
      )
    );
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        data-layout="sidebar"
        className={cn(
          "max-w-[290px] overflow-hidden border-r border-[hsl(var(--border))] bg-[var(--lt-bg)] transition-[width] duration-200 ease-linear",
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen",
          isOpen ? "w-full" : "w-0"
        )}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="flex h-full flex-col py-10 pl-[25px] pr-[7px]">
          <div className="relative pr-4.5">
            <Link
              href={"/"}
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 py-2.5 min-[850px]:py-0"
            >
              <Logo />
            </Link>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right text-[hsl(var(--sidebar-foreground))]"
              >
                <span className="sr-only">Close Menu</span>
                <ArrowLeftIcon className="ml-auto size-7" />
              </button>
            )}
          </div>

          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
            {NAV_DATA.map((section) => (
              <div key={section.label} className="mb-6">
                <h2 className="mb-5 text-sm font-medium text-[hsl(var(--sidebar-foreground))] dark:text-[hsl(var(--muted-foreground))]">
                  {section.label}
                </h2>

                <nav role="navigation" aria-label={section.label}>
                  <ul className="space-y-2">
                    {section.items.map((item) => {
                      const hasChildren = item.items.length > 0;

                      if (hasChildren) {
                        const isSectionActive = item.items.some(
                          ({ url }) => `${base}${url}` === pathname
                        );

                        return (
                          <li key={item.title}>
                            <div>
                              <MenuItem
                                isActive={isSectionActive}
                                onClick={() => toggleExpanded(item.title)}
                              >
                                <item.icon className="size-6 shrink-0" aria-hidden="true" />
                                <span>{item.title}</span>
                                <ChevronUp
                                  className={cn(
                                    "ml-auto rotate-180 transition-transform duration-200",
                                    expandedItems.includes(item.title) && "rotate-0"
                                  )}
                                  aria-hidden="true"
                                />
                              </MenuItem>

                              {expandedItems.includes(item.title) && (
                                <ul className="ml-9 space-y-1.5">
                                  {item.items.map((subItem) => (
                                    <li key={subItem.url}>
                                      <MenuItem
                                        isActive={`${base}${subItem.url}` === pathname}
                                        component="a"
                                        href={`${base}${subItem.url}`}
                                      >
                                        <span>{subItem.title}</span>
                                      </MenuItem>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </li>
                        );
                      }

                      return (
                        <li key={item.title}>
                          <MenuItem
                            isActive={`${base}${item.url}` === pathname}
                            component="a"
                            href={`${base}${item.url}`}
                          >
                            <item.icon className="size-6 shrink-0" aria-hidden="true" />
                            <span>{item.title}</span>
                          </MenuItem>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}