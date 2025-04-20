"use client";

import { useTheme } from "@/app/provider";
import { ReactNode } from "react";
import "@/app/globals.css";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { themeType } = useTheme();

  return (
    <div className="bg-background text-foreground">
      {children}
    </div>
  );
}
