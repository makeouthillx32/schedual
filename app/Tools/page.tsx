"use client";

import { tools } from "@/lib/toolsConfig";
import Link from "next/link";

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