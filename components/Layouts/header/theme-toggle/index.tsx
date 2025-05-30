import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getCookie } from "@/lib/cookieUtils";
import { useTheme } from "@/app/provider"; // ✅ Use your custom theme context
import { Moon, Sun } from "./icons";

const THEMES = [
  {
    name: "light",
    Icon: Sun,
  },
  {
    name: "dark",
    Icon: Moon,
  },
];

export function ThemeToggleSwitch() {
  const { toggleTheme } = useTheme(); // ✅ Use your custom context instead of next-themes
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get the current theme from your cookie system
    const theme = getCookie("theme");
    setIsDark(theme === "dark");
  }, []);

  const handleToggle = () => {
    setIsDark((prev) => !prev);
    toggleTheme(); // ✅ Use your custom toggle function
  };

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      className="group rounded-full bg-gray-3 p-[5px] text-[hsl(var(--foreground))] outline-1 outline-[hsl(var(--sidebar-primary))] focus-visible:outline dark:bg-[hsl(var(--background))] dark:text-current"
    >
      <span className="sr-only">
        Switch to {isDark ? "light" : "dark"} mode
      </span>

      <span aria-hidden className="relative flex gap-2.5">
        {/* Indicator - moves based on isDark state */}
        <span className={cn(
          "absolute size-[38px] rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] transition-all",
          isDark 
            ? "translate-x-[48px] border-none bg-[hsl(var(--secondary))] group-hover:bg-[hsl(var(--accent))]"
            : ""
        )} />

        {THEMES.map(({ name, Icon }) => (
          <span
            key={name}
            className={cn(
              "relative grid size-[38px] place-items-center rounded-full",
              name === "dark" && isDark && "text-[hsl(var(--foreground))]",
            )}
          >
            <Icon />
          </span>
        ))}
      </span>
    </button>
  );
}