"use client";

import React from "react";
import { tools } from "@/lib/toolsConfig";

const ToolsPage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Available Tools</h1>
      <ul className="list-disc ml-5">
        {tools.map((tool) => (
          <li key={tool.name}>
            <a href={tool.path} className="text-blue-600 hover:underline">
              {tool.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ToolsPage;