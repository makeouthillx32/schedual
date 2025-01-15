"use client";

import "@/app/globals.css"; // Correct absolute path to CSS
import { Providers } from "@/app/provider"; // Ensure Providers wrap for theming

interface LayoutProps {
  children: React.ReactNode;
}

const ScheduleLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Providers>
      {children}
    </Providers>
  );
};

export default ScheduleLayout;