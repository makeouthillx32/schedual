// app/layout.tsx
import { Providers } from "./provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import AccessibilityOverlay from "@/components/theme/accessibility";
import "./globals.css";
import type { Metadata } from "next";
import ClientLayoutWrapper from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: {
    template: '%s | Desert Area Resources and Training',
    default: 'Desert Area Resources and Training - Disability Services & Support Organization in Ridgecrest California, 93555',
  },
  description: 'From support services, career opportunities, fun events, and business services, discover all Desert Area Resources and Training has to offer! Start Here. Desert Area Resources and Training serves people in Southern California with comprehensive disability support services.',
  metadataBase: new URL('https://schedual-five.vercel.app'),
  keywords: [
    'disability services',
    'support organization',
    'Ridgecrest California',
    'career opportunities',
    'business services',
    'Southern California',
    'resources',
    'training',
    'accessibility',
    'community support'
  ],
  authors: [{ name: 'Desert Area Resources and Training' }],
  creator: 'Desert Area Resources and Training',
  publisher: 'Desert Area Resources and Training',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://schedual-five.vercel.app/',
    siteName: 'Desert Area Resources and Training',
    title: 'Desert Area Resources and Training - Disability Services & Support Organization in Ridgecrest California',
    description: 'From support services, career opportunities, fun events, and business services, discover all Desert Area Resources and Training has to offer!',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Desert Area Resources and Training' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@DesertAreaRT',
    creator: '@DesertAreaRT',
    title: 'Desert Area Resources and Training - Disability Services & Support Organization in Ridgecrest California',
    description: 'From support services, career opportunities, fun events, and business services, discover all Desert Area Resources and Training has to offer!',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  applicationName: 'Desert Area Resources and Training',
  referrer: 'origin-when-cross-origin',
  category: 'Disability Services',
  other: {
    'contact:phone_number': '+1-760-375-9787',
    'contact:email': 'info@desertareart.org',
    'business:contact_data:locality': 'Ridgecrest',
    'business:contact_data:region': 'California',
    'business:contact_data:postal_code': '93555',
    'business:contact_data:country_name': 'United States',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="format-detection" content="telephone=no" />

        {/* Favicon — NO manifest link here. Each mini-app layout declares its own. */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        <link rel="canonical" href="https://schedual-five.vercel.app/" />

        <meta name="geo.region" content="US-CA" />
        <meta name="geo.placename" content="Ridgecrest" />
        <meta name="geo.position" content="35.6225;-117.6709" />
        <meta name="ICBM" content="35.6225, -117.6709" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Desert Area Resources and Training",
              "description": "Disability services and support organization serving Southern California",
              "url": "https://schedual-five.vercel.app/",
              "logo": "https://schedual-five.vercel.app/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-760-375-9787",
                "contactType": "Customer Service",
                "availableLanguage": ["English", "Spanish"]
              },
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Ridgecrest",
                "addressRegion": "CA",
                "postalCode": "93555",
                "addressCountry": "US"
              }
            })
          }}
        />
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