"use client";

import { notFound } from "next/navigation";
import TimesheetCalculator from "@/components/tools/timesheet-calculator";
import Tool1 from "@/components/tools/tool-1";
import Tool2 from "@/components/tools/tool-2";

const toolsMap: Record<string, React.FC> = {
  "timesheet-calculator": TimesheetCalculator,
  "tool-1": Tool1,
  "tool-2": Tool2,
};

const ToolPage = ({ params }: { params: { tool: string } }) => {
  const ToolComponent = toolsMap[params.tool];

  if (!ToolComponent) {
    notFound(); // Show 404 if tool does not exist
    return null;
  }

  return (
    <div>
      <ToolComponent />
    </div>
  );
};

export default ToolPage;