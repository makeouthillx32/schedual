"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "@/app/provider";
import { usePathname } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import type { Session } from "@supabase/auth-helpers-nextjs";

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
  const { themeType } = useTheme();
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Dynamic session so sign-in and log-out appear instantly
  const supabase = useSupabaseClient();
  const [session, setSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    // Function to fetch current session
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    // Initial fetch
    fetchSession();

    // Check if we have ?refresh=true in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("refresh") === "true") {
      fetchSession().then(() => {
        params.delete("refresh");
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", newUrl);
      });
    }

    // Listen for auth changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchSession();
    });

    return () => {
      // Cleanup the subscription on unmount
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const activePage = pathname.split("/")[1] || "home";
  const settingsLink = `/settings/${activePage}`;

  const handleMenuClick = () => setOpen(false);
  const handleLogout = () => {
    window.location.href = "/auth/logout";
  };

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
        <DropdownMenuCurrentDateTime />
        <DropdownMenuItem onSelect={handleMenuClick}>
          <Link href="/">Home</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleMenuClick}>
          <Link href="/CMS/schedule">Schedule</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleMenuClick}>
          <Link href={settingsLink}>Settings</Link>
        </DropdownMenuItem>

        {/* Show Profile if user is logged in */}
        {session?.user?.id && (
          <DropdownMenuItem onSelect={handleMenuClick}>
            <Link href={`/profile/${session.user.id}`}>Profile</Link>
          </DropdownMenuItem>
        )}

        {/* Show Sign in if user is NOT logged in */}
        {!session && (
          <DropdownMenuItem onSelect={handleMenuClick}>
            <Link href="/sign-in">Sign in</Link>
          </DropdownMenuItem>
        )}

        {/* Show Log out if user is logged in */}
        {session && (
          <DropdownMenuItem variant="danger" onSelect={handleLogout}>
            Log out
          </DropdownMenuItem>
        )}
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
