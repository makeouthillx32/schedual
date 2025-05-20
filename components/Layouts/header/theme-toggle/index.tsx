import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
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
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="group rounded-full bg-gray-3 p-[5px] text-[hsl(var(--foreground))] outline-1 outline-[hsl(var(--sidebar-primary))] focus-visible:outline dark:bg-[hsl(var(--background))] dark:text-current"
    >
      <span className="sr-only">
        Switch to {theme === "light" ? "dark" : "light"} mode
      </span>

      <span aria-hidden className="relative flex gap-2.5">
        {/* Indicator */}
        <span className="absolute size-[38px] rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] transition-all dark:translate-x-[48px] dark:border-none dark:bg-[hsl(var(--secondary))] dark:group-hover:bg-[hsl(var(--accent))]" />

        {THEMES.map(({ name, Icon }) => (
          <span
            key={name}
            className={cn(
              "relative grid size-[38px] place-items-center rounded-full",
              name === "dark" && "dark:text-[hsl(var(--foreground))]",
            )}
          >
            <Icon />
          </span>
        ))}
      </span>
    </button>
  );
}