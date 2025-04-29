"use client";

import Home from "@/components/home/Home";

export const generateMetadata = () => ({
  title: "Home | Desert Area Resources and Training",
  description: "Welcome to Desert Area Resources and Training.",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" }, // light mode for Home
    { media: "(prefers-color-scheme: dark)", color: "#2d3142" },   // dark mode for Home
  ],
});

export default function Page() {
  return (
    <div>
      <Home />
    </div>
  );
}