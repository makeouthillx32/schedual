"use client";

import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function CatalogLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen p-5 bg-gray-100">
      <header className="text-3xl font-bold text-center mb-6">
        Product Catalog
      </header>
      <main className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        {children}
      </main>
    </div>
  );
}