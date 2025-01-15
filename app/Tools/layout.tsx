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
  const pathname = usePathname();

  // Check if the current path is in /Tools
  const pageTitle = pathname?.startsWith("/Tools") ? "tools" : undefined;

  return (
    <div>
      <Nav pageTitle={pageTitle} /> {/* Dynamically add pageTitle for Tools */}
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default ToolsLayout;