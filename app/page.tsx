import Home from "@/components/home/Home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Desert Area Resources and Training",
  description: "Welcome to Desert Area Resources and Training.",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" }, // Light for home
    { media: "(prefers-color-scheme: dark)", color: "#2d3142" },  // Dark for home
  ],
};

export default function Page() {
  return (
    <div>
      <Home />
    </div>
  );
}