// app/layout.tsx - MINIMAL CHANGE TO YOUR EXISTING CODE
import { Providers } from "./provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import AccessibilityOverlay from "@/components/theme/accessibility";
import "./globals.css";
import type { Metadata } from "next";
import ClientLayoutWrapper from "@/components/ClientLayout";

// ✅ Add this metadata to enable OpenGraph auto-detection
export const metadata: Metadata = {
  title: {
    template: '%s | Desert Area Resources and Training',
    default: 'Desert Area Resources and Training',
  },
  description: 'Welcome to Desert Area Resources and Training.',
  metadataBase: new URL('https://schedual-five.vercel.app'),
};

// ✅ Keep the HTML structure server-side, move client logic to wrapper
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
      <body className="min-h-screen font-[var(--font-sans)]">
        <Providers>
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}