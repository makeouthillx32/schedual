"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { transitionTheme } from "@/utils/themeTransitions";

function DashboardThemeManager({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).smoothToggleTheme = async (coordinates?: { x: number; y: number }) => {
        const themeChangeCallback = () => {
          theme.setTheme(theme.resolvedTheme === 'dark' ? 'light' : 'dark');
        };
        await transitionTheme(themeChangeCallback, coordinates);
      };

      (window as any).smoothSetTheme = async (newTheme: string, coordinates?: { x: number; y: number }) => {
        const themeChangeCallback = () => {
          theme.setTheme(newTheme);
        };
        await transitionTheme(themeChangeCallback, coordinates);
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).smoothToggleTheme;
        delete (window as any).smoothSetTheme;
      }
    };
  }, [theme]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <DashboardThemeManager>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </DashboardThemeManager>
    </ThemeProvider>
  );
}