// app/page.tsx
import Home from "@/components/home/Home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Desert Area Resources and Training",
  description: "Welcome to Desert Area Resources and Training.",
  openGraph: {
    title: "Desert Area Resources and Training",
    description: "Welcome to Desert Area Resources and Training.",
    type: "website",
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Desert Area Resources and Training',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Desert Area Resources and Training",
    description: "Welcome to Desert Area Resources and Training.",
    images: ['/opengraph-image.png'],
  },
  // Remove the themeColor stuff I added!
};

export default function Page() {
  return (
    <div>
      <Home />
    </div>
  );
}