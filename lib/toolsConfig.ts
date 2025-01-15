import TimesheetCalculator from "@/components/tools/timesheet-calculator";

export const tools = [
  {
    name: "Timesheet Calculator",
    path: "/Tools/timesheet-calculator",
    component: TimesheetCalculator, // Import directly from components
  },
  {
    name: "Tool 1",
    path: "/Tools/tool-1",
    component: () => <div>Tool 1</div>, // Placeholder for additional tools
  },
  {
    name: "Tool 2",
    path: "/Tools/tool-2",
    component: () => <div>Tool 2</div>, // Placeholder for additional tools
  },
];