"use client";

import { Providers } from "@/app/provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import "@/app/global.css"; // Corrected path for global styles

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
          <Footer />
        </Providers>
      </body>
    </html>
  );
};

export default Layout;