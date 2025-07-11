// app/layout.tsx (Clean server component)
import { Metadata } from "next";
import { Providers } from "./provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DARTS - Digital Accessibility Resource & Training System",
    template: "%s | DARTS"
  },
  description: "Professional tools and resources for digital accessibility training and punch card generation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}