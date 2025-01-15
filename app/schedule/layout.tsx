"use client";

import { Providers } from "@/app/provider"; // Import Providers from your app
import "@/app/globals.css"; // Correct absolute path to CSS
import Nav from "@/components/nav"; // Optional: Add navigation if needed
import Footer from "@/components/footer"; // Optional: Add footer if needed

interface LayoutProps {
  children: React.ReactNode;
}

const ScheduleLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Nav /> {/* Include navigation if required */}
          <main>{children}</main>
          <Footer /> {/* Include footer if required */}
        </Providers>
      </body>
    </html>
  );
};

export default ScheduleLayout;