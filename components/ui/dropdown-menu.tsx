"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = DropdownMenuPrimitive.Content;

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
            <div className="w-6 h-0.5 rounded bg-foreground transition-colors"></div>
            <div className="w-6 h-0.5 rounded bg-foreground transition-colors"></div>
            <div className="w-6 h-0.5 rounded bg-foreground transition-colors"></div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="z-50 min-w-[8rem] rounded-md border shadow-md bg-popover text-popover-foreground"
        sideOffset={8}
      >
        <div className="flex flex-col space-y-1">
          <DropdownMenuPrimitive.Item
            className="p-2 text-sm cursor-pointer hover:bg-muted hover:text-muted-foreground"
          >
            Home
          </DropdownMenuPrimitive.Item>
          <DropdownMenuPrimitive.Item
            className="p-2 text-sm cursor-pointer hover:bg-muted hover:text-muted-foreground"
          >
            Schedule
          </DropdownMenuPrimitive.Item>
          <DropdownMenuPrimitive.Item
            className="p-2 text-sm cursor-pointer hover:bg-muted hover:text-muted-foreground"
          >
            Settings
          </DropdownMenuPrimitive.Item>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { CustomDropdown };