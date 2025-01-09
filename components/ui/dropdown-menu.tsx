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
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center p-2"
          aria-label="Toggle menu"
          onClick={toggleMenu}
          style={{
            position: "relative",
            width: "30px",
            height: "24px",
            cursor: "pointer",
          }}
        >
          {/* Animated Hamburger Icon */}
          <span
            style={{
              display: "block",
              width: "100%",
              height: "4px",
              backgroundColor: isOpen
                ? "var(--primary-foreground, black)" // Fallback for light/dark mode
                : "var(--foreground, black)",
              borderRadius: "2px",
              position: "absolute",
              top: isOpen ? "10px" : "0",
              transform: isOpen ? "rotate(45deg)" : "none",
              transition: "all 0.3s ease",
            }}
          ></span>
          <span
            style={{
              display: "block",
              width: "100%",
              height: "4px",
              backgroundColor: "var(--foreground, black)",
              borderRadius: "2px",
              position: "absolute",
              top: "10px",
              opacity: isOpen ? "0" : "1",
              transition: "all 0.3s ease",
            }}
          ></span>
          <span
            style={{
              display: "block",
              width: "100%",
              height: "4px",
              backgroundColor: isOpen
                ? "var(--primary-foreground, black)" // Fallback for light/dark mode
                : "var(--foreground, black)",
              borderRadius: "2px",
              position: "absolute",
              top: isOpen ? "10px" : "20px",
              transform: isOpen ? "rotate(-45deg)" : "none",
              transition: "all 0.3s ease",
            }}
          ></span>
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