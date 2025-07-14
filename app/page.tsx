// app/page.tsx
import Home from "@/components/home/Home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Desert Area Resources and Training",
  description: "Welcome to Desert Area Resources and Training.",
  // Remove all the openGraph and twitter stuff!
  // Let Next.js auto-detect your opengraph-image.png
};

export default function Page() {
  return (
    <div>
      <Home />
    </div>
  );
}