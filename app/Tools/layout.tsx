"use client";

import Nav from "@/components/nav";
import Footer from "@/components/footer";

interface LayoutProps {
  children: React.ReactNode;
}

const ToolsLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <Nav pageTitle="tools" />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
};

export default ToolsLayout;