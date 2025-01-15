"use client";

import React from "react";
import { useTheme } from "@/app/provider";

const Footer: React.FC = () => {
  const { themeType } = useTheme();
  const currentYear = new Date().getFullYear();

  // List of tools
  const tools = [
    { name: "Timesheet Calculator", path: "/tools/timesheet-calculator" },
    // { name: "Tool 1", path: "/tools/tool1" },
    // { name: "Tool 2", path: "/tools/tool2" },
  ];

  return (
    <footer
      className={`p-4 ${
        themeType === "dark" ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-700"
      } flex flex-col items-center`}
    >
      <div className="w-full text-left mb-2">
        <h3
          className={`text-sm font-bold ${
            themeType === "dark" ? "text-gray-200" : "text-black"
          } tracking-[0]`}
        >
          Tools
        </h3>
        <ul className="leading-[1.1] tracking-[0]">
          {tools.map((tool) => (
            <li key={tool.name}>
              <a
                href={tool.path}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {tool.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-gray-400 tracking-[0] leading-[1.1]">
        Powered by Unenter © {currentYear}
      </p>
    </footer>
  );
};

export default Footer;
