"use client";

import { ReactNode } from "react";
import { Providers } from "@/app/provider"; // Ensure correct import for theme context
import { useTheme } from "@/app/provider";
import "@/app/globals.css"; // Import global styles

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

  return (
    <div className={`min-h-screen p-5 ${themeType === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <header className="text-3xl font-bold text-center mb-6">
        Product Catalog
      </header>
      <main className={`max-w-4xl mx-auto p-6 rounded shadow ${themeType === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
        {children}
      </main>
    </div>
  );
};