"use client";

import { ThemeProvider } from "./provider";
import Nav from "@/components/nav";
import "./globals.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Nav />
          <main style={{ padding: "20px" }}>{children}</main>
          <footer
            style={{
              padding: "10px",
              textAlign: "center",
            }}
          >
            <p>&copy; {new Date().getFullYear()} Powered by unenter</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default Layout;