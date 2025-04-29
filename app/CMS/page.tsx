"use client";

import Hero from "@/components/hero";

export const generateMetadata = () => ({
  title: "CMS Schedule | Commercial Services",
  description: "View and manage your cleaning schedules with the CMS tool.",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" }, // light mode app background
    { media: "(prefers-color-scheme: dark)", color: "#111827" },  // dark mode app background
  ],
});

export default function Page() {
  return (
    <div>
      <Hero />
    </div>
  );
}