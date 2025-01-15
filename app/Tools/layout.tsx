"use client";

import { usePathname } from "next/navigation";
import { Providers } from "@/app/provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import "@/globals.css";

interface LayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();

  // Exclude Nav and Footer for Tools pages
  const excludeGlobalLayout = pathname?.startsWith("/Tools");

  return (
    <html lang="en">
      <body>
        <Providers>
          {!excludeGlobalLayout && <Nav />}
          <main>{children}</main>
          {!excludeGlobalLayout && <Footer />}
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;