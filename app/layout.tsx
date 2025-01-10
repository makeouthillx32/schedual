"use client";

import { Providers } from "./providers"; // Adjust path if needed
import Nav from "@/components/nav";
import "./globals.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Nav />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
};

export default Layout;