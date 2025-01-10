"use client";

import { Providers } from "@/app/provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import "@/app/globals.css"; // Correct absolute path to your CSS

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