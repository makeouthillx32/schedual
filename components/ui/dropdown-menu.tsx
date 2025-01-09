"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm transition-colors focus:bg-accent",
      className
    )}
    {...props}
  />
));
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center w-8 h-8"
          aria-label="Toggle menu"
        >
          {/* Hamburger menu */}
          <div className="space-y-1.5">
            <div className="w-6 h-0.5 bg-black dark:bg-white"></div>
            <div className="w-6 h-0.5 bg-black dark:bg-white"></div>
            <div className="w-6 h-0.5 bg-black dark:bg-white"></div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCurrentDateTime />
        <DropdownMenuItem>
          <a href="#">Home</a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href="#">Schedule</a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href="#">Settings</a>
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