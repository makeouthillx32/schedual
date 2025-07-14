// app/layout.tsx
import { Providers } from "./provider";
import ClientLayout from "@/components/ClientLayout";
import AccessibilityOverlay from "@/components/theme/accessibility";
import "./globals.css";
import type { Metadata } from "next";

// ✅ This is now a SERVER COMPONENT - enables OpenGraph auto-detection
export const metadata: Metadata = {
  title: {
    template: '%s | Desert Area Resources and Training',
    default: 'Desert Area Resources and Training',
  },
  description: 'Welcome to Desert Area Resources and Training.',
  metadataBase: new URL('https://schedual-five.vercel.app'),
  openGraph: {
    title: 'Desert Area Resources and Training',
    description: 'Welcome to Desert Area Resources and Training.',
    url: 'https://schedual-five.vercel.app',
    siteName: 'Desert Area Resources and Training',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Desert Area Resources and Training',
    description: 'Welcome to Desert Area Resources and Training.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
          <AccessibilityOverlay />
        </Providers>
      </body>
    </html>
  );
}