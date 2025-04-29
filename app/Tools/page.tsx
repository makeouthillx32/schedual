"use client";

import { tools } from "@/lib/toolsConfig";
import Link from "next/link";

export const generateMetadata = () => ({
  title: "Tools | CMS Helper Utilities",
  description: "Quick access to internal tools for the CMS Schedule App.",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
});

const ToolsPage: React.FC = () => {
  return (
    <div>
      <h1>Available Tools</h1>
      <ul>
        {tools.map((tool) => (
          <li key={tool.name}>
            <Link href={tool.path}>{tool.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ToolsPage;