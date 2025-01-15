"use client";

import { tools } from "@/lib/toolsConfig";

const ToolPage: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const toolName = params.get("toolName");

  // Find the tool based on the name in the configuration
  const tool = tools.find((t) => t.path.includes(toolName || ""));

  if (!tool) {
    return (
      <div>
        <h1>Tool Not Found</h1>
        <p>The tool you are looking for does not exist.</p>
      </div>
    );
  }

  // Render the tool dynamically
  const ToolComponent = tool.component;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{tool.name}</h1>
      <ToolComponent />
    </div>
  );
};

export default ToolPage;