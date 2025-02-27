"use client";

import { ReactNode, useEffect } from "react";
import { Providers, useTheme } from "@/app/provider";
import "@/app/globals.css";

interface LayoutProps {
  children: ReactNode;
}

export default function CatalogLayout({ children }: LayoutProps) {
  return (
    <Providers>
      <ThemedCatalogLayout>{children}</ThemedCatalogLayout>
    </Providers>
  );
}

const ThemedCatalogLayout: React.FC<LayoutProps> = ({ children }) => {
  const { themeType } = useTheme();

  // Apply dark mode class to <html> dynamically
  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeType === "dark");
  }, [themeType]);

  return (
    <div className={`min-h-screen p-5 ${themeType === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <main className={`max-w-4xl mx-auto p-6 rounded shadow bg-card text-card-foreground`}>
        {children}
      </main>
    </div>
  );
};