"use client";

import { Providers } from "@/app/provider"; // Reuse theme provider
import Nav from "@/components/nav";
import Footer from "@/components/footer";

interface LayoutProps {
  children: React.ReactNode;
}

const ScheduleLayout: React.FC<LayoutProps> = ({ children }) => {
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

export default ScheduleLayout;