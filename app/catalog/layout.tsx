"use client";

import { ReactNode, useEffect } from "react";
import { Providers, useTheme } from "@/app/provider"; // Correctly using your provider
import "@/app/globals.css"; // Using your actual Tailwind setup

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

  // Apply dark mode styles from globals.css
  useEffect(() => {
    if (themeType === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeType]);

  return (
    <div className="min-h-screen p-5 bg-background text-foreground">
      <main className="max-w-4xl mx-auto p-6 rounded shadow bg-card text-card-foreground">
        {children}
      </main>
    </div>
  );
};