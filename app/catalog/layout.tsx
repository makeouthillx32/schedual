"use client";

import { ReactNode, useEffect, useState } from "react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import "@/app/globals.css";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  // Load the theme from localStorage or system preferences
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(storedTheme ? (storedTheme as "light" | "dark") : systemPrefersDark ? "dark" : "light");
  }, []);

  // Apply the theme class to <html> tag immediately
  useEffect(() => {
    if (theme) {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  // Prevent rendering until theme is determined
  if (!theme) return null;

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}