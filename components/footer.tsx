"use client";

import React from "react";
import { useTheme } from "@/app/provider";

const Footer: React.FC = () => {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";
  const currentYear = new Date().getFullYear();

  // List of tools
  const tools = [
    { name: "Timesheet Calculator", path: "/Tools/timesheet-calculator" },
    // { name: "Tool 1", path: "/tools/tool1" },
    // { name: "Tool 2", path: "/tools/tool2" },
  ];

  return (
    <footer
      className={`p-4 flex flex-col items-center ${
        isDark 
          ? "bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]" 
          : "bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]"
      } border-t border-[hsl(var(--sidebar-border))]`}
    >
      <div className="w-full text-left mb-2">
        <h3 className="text-sm font-bold tracking-[0] text-[hsl(var(--sidebar-primary))]">
          Tools
        </h3>
        <ul className="leading-[1.1] tracking-[0]">
          {tools.map((tool) => (
            <li key={tool.name}>
              <a
                href={tool.path}
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--sidebar-primary))] transition-colors duration-200"
              >
                {tool.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-[hsl(var(--muted-foreground))] tracking-[0] leading-[1.1]">
        Powered by Unenter © {currentYear}
      </p>
    </footer>
  );
};

export default Footer;