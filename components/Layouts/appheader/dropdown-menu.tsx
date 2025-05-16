// components/ui/dropdown-menu.tsx
"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { useTheme } from "@/app/provider";
import { usePathname } from "next/navigation";
import useLoginSession from "@/lib/useLoginSession";
import LogoutButton from "@/components/Layouts/appheader/LogoutButton";
import SignInButton from "@/components/Layouts/appheader/SignInButton";
// — Replaced ProfileButton with DashboardButton —
import DashboardButton from "@/components/Layouts/appheader/DashboardButton";
import SettingsButton from "@/components/Layouts/appheader/SettingsButton";
import ScheduleButton from "@/components/Layouts/appheader/ScheduleButton";
import HomeButton from "@/components/Layouts/appheader/HomeButton";
import CurrentDateTime from "@/components/Layouts/appheader/CurrentDateTime";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const { themeType } = useTheme();

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          `z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md data-[state=open]:animate-in ${
            themeType === "dark"
              ? "bg-gray-900 text-white border-gray-700"
              : "bg-white text-black border-gray-300"
          }`,
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    variant?: "default" | "danger";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const { themeType } = useTheme();

  const baseStyle = `flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm transition-colors focus:outline-none`;
  const colorStyle =
    variant === "danger"
      ? themeType === "dark"
        ? "text-red-500 hover:bg-red-900"
        : "text-red-600 hover:bg-red-100"
      : themeType === "dark"
      ? "text-white focus:bg-gray-800"
      : "text-black focus:bg-gray-200";

  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(baseStyle, colorStyle, className)}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const CustomDropdown: React.FC = () => {
  const { themeType } = useTheme();
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const session = useLoginSession();

  const activePage = pathname.split("/")[1] || "home";
  const handleMenuClick = () => setOpen(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center w-8 h-8"
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <div
              className={`w-6 h-0.5 ${
                themeType === "dark" ? "bg-white" : "bg-black"
              }`}
            />
            <div
              className={`w-6 h-0.5 ${
                themeType === "dark" ? "bg-white" : "bg-black"
              }`}
            />
            <div
              className={`w-6 h-0.5 ${
                themeType === "dark" ? "bg-white" : "bg-black"
              }`}
            />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <CurrentDateTime />
        <HomeButton onClick={handleMenuClick} />
        <ScheduleButton onClick={handleMenuClick} />
        <SettingsButton activePage={activePage} onClick={handleMenuClick} />
        {session?.user?.id && (
          <DashboardButton onClick={handleMenuClick} />
        )}
        {!session && <SignInButton onClick={handleMenuClick} />}
        {session && <LogoutButton />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export {
  CustomDropdown,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
