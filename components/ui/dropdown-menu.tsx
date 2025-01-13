"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import Link from "next/link"; // Import Link for Next.js routing
import { cn } from "@/lib/utils";
import { useTheme } from "@/app/provider"; // Import the theme hook

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const { themeType } = useTheme(); // Get the current theme from the provider

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
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => {
  const { themeType } = useTheme(); // Get the current theme for item styling

  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        `flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm transition-colors focus:outline-none ${
          themeType === "dark"
            ? "focus:bg-gray-800 text-white"
            : "focus:bg-gray-200 text-black"
        }`,
        className
      )}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCurrentDateTime: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <DropdownMenuItem>
      <span className="text-xs">
        {currentDateTime.toLocaleDateString()}{" "}
        {currentDateTime.toLocaleTimeString()}
      </span>
    </DropdownMenuItem>
  );
};

const CustomDropdown: React.FC = () => {
  const { themeType } = useTheme(); // Access the current theme ("light" or "dark")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center w-8 h-8"
          aria-label="Toggle menu"
        >
          {/* Hamburger menu */}
          <div className="space-y-1.5">
            <div
              className={`w-6 h-0.5 ${
                themeType === "dark" ? "bg-white" : "bg-black"
              }`}
            ></div>
            <div
              className={`w-6 h-0.5 ${
                themeType === "dark" ? "bg-white" : "bg-black"
              }`}
            ></div>
            <div
              className={`w-6 h-0.5 ${
                themeType === "dark" ? "bg-white" : "bg-black"
              }`}
            ></div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCurrentDateTime />
        <DropdownMenuItem>
          <Link href="/">Home</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/schedule">Schedule</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
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
  DropdownMenuCurrentDateTime,
};