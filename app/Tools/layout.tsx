"use client";

import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { Providers } from "@/app/provider"; // Ensure this path matches your project structure

interface LayoutProps {
  children: React.ReactNode;
}

const ToolsLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Nav pageTitle="tools" />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
};

export default ToolsLayout;