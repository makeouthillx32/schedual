import TimesheetCalculator from "@/components/tools/timesheet-calculator";
import PunchCardMaker from "@/components/tools/PunchCardMaker";
import DeliveryIntakeForm from "@/components/tools/DeliveryIntakeForm";

export const tools = [
  {
    name: "Delivery Intake",
    path: "/Tools/delivery-intake",
    component: DeliveryIntakeForm,
    description: "Schedule a delivery or furniture pickup for DART Thrift.",
    icon: "📋",
    public: true,
  },
  {
    name: "Timesheet Calculator",
    path: "/Tools/timesheet-calculator",
    component: TimesheetCalculator,
    description: "Calculate and export weekly timesheets.",
    icon: "🕐",
    public: false,
  },
  {
    name: "Punch Card Maker",
    path: "/Tools/punch-card-maker",
    component: PunchCardMaker,
    description: "Design and print punch cards for clients.",
    icon: "🃏",
    public: false,
  },
];