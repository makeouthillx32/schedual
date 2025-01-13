"use client";

import { Providers } from "./provider"; // Path to your provider
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Initial theme-color */}
        <meta name="theme-color" id="theme-color-meta" content="#ffffff" />
      </head>
      <body>
        <Providers>
          <Nav />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}