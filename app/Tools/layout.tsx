"use client";

import { usePathname } from "next/navigation";
import { Providers } from "@/app/provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import "../globals.css"; // Correct relative path from `/Tools` to `/globals.css`

interface ToolsLayoutProps {
  children: React.ReactNode;
}

const ToolsLayout: React.FC<ToolsLayoutProps> = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  );
};

export default ToolsLayout;