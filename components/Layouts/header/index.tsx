"use client";

import { SearchIcon } from "@/assets/icons";
import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";
import SwitchtoDarkMode from "@/components/SwitchtoDarkMode";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 shadow-1 dark:border-stroke-dark dark:bg-[hsl(var(--card))] md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="rounded-lg border px-1.5 py-1 dark:border-stroke-dark dark:bg-[hsl(var(--background))] hover:dark:bg-[hsla(var(--background),0.1)] lg:hidden"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href={"/"} className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
          <Image
            src={"/images/logo/logo-icon.svg"}
            width={50}
            height={50}
            alt="Logo"
            role="presentation"
          />
        </Link>
      )}

      <div className="max-xl:hidden">
        <h1 className="mb-0.5 text-heading-5 font-bold text-dark dark:text-[hsl(var(--foreground))]">
          Dashboard
        </h1>
        <p className="font-medium dark:text-[hsl(var(--muted-foreground))]">DART Dashboard</p>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-4">
        <div className="relative w-full max-w-[300px]">
          <input
            type="search"
            placeholder="Search"
            className="flex w-full items-center gap-3.5 rounded-full border bg-gray-2 py-3 pl-[53px] pr-5 outline-none transition-colors focus-visible:border-[hsl(var(--sidebar-primary))] dark:border-[hsl(var(--border))] dark:bg-[hsl(var(--secondary))] dark:hover:border-[hsl(var(--border))] dark:hover:bg-[hsl(var(--secondary))] dark:hover:text-[hsl(var(--muted-foreground))] dark:focus-visible:border-[hsl(var(--sidebar-primary))]"
          />
          <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 max-[1015px]:size-5" />
        </div>

        {/* Wrap theme toggle to prevent size constraints */}
        <div className="flex items-center justify-center">
          {isMobile ? <SwitchtoDarkMode /> : <ThemeToggleSwitch />}
        </div>

        {/* This will show the notification bell with dot */}
        <Notification />

        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}