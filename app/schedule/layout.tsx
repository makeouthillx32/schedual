"use client";

import "@/app/globals.css"; // Correct path for global styles
import { Providers } from "@/app/provider"; // Correct provider import

interface LayoutProps {
  children: React.ReactNode;
}

const ScheduleLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Providers>
      <div>{children}</div> {/* Ensure the theme context propagates */}
    </Providers>
  );
};

export default ScheduleLayout;