"use client";

import React from "react";
import { useTheme } from "@/app/provider";

const Footer: React.FC = () => {
  const { themeType } = useTheme();
  const currentYear = new Date().getFullYear();

  // List of tools
  const tools = [
    { name: "Timesheet Calculator", path: "/Tools/timesheet-calculator" },
    // { name: "Tool 1", path: "/tools/tool1" },
    // { name: "Tool 2", path: "/tools/tool2" },
  ];

  return (
    <footer
      className="p-4 bg-[var(--hnf-background)] text-[var(--hnf-foreground)] flex flex-col items-center"
    >
      <div className="w-full text-left mb-2">
        <h3 className="text-sm font-bold tracking-[0] text-[var(--hnf-heading)]">
          Tools
        </h3>
        <ul className="leading-[1.1] tracking-[0]">
          {tools.map((tool) => (
            <li key={tool.name}>
              <a
                href={tool.path}
                className="text-sm text-[var(--hnf-muted)] hover:text-[var(--hnf-muted-hover)]"
              >
                {tool.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-[var(--hnf-muted)] tracking-[0] leading-[1.1]">
        Powered by Unenter © {currentYear}
      </p>
    </footer>
  );
};

export default Footer;
