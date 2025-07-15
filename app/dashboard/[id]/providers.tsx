"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect } from "react";
import { smoothThemeToggle, transitionTheme } from "@/utils/themeTransitions";

// Enhanced theme color manager for dashboard with better iOS support
function DashboardThemeColorManager() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const updateThemeColor = () => {
      // Get computed background color
      const htmlElement = document.documentElement;
      let themeColor = getComputedStyle(htmlElement).getPropertyValue("--background").trim();
      
      // Handle CSS custom property references
      if (themeColor.startsWith("var(--")) {
        themeColor = getComputedStyle(htmlElement).getPropertyValue(themeColor.slice(4, -1)).trim();
      }
      
      // Default fallback colors
      if (!themeColor || themeColor === "") {
        themeColor = resolvedTheme === "dark" ? "111827" : "ffffff";
      }

      // Convert HSL to hex if needed
      let finalColor = themeColor;
      if (themeColor.includes(" ")) {
        // If it's HSL format (e.g., "220 14% 11%"), convert to hsl()
        finalColor = `hsl(${themeColor})`;
        
        // Create temporary element to get computed RGB
        const tempDiv = document.createElement('div');
        tempDiv.style.color = finalColor;
        document.body.appendChild(tempDiv);
        const computedColor = getComputedStyle(tempDiv).color;
        document.body.removeChild(tempDiv);

        // Convert RGB to hex
        const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          finalColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        }
      } else if (!themeColor.startsWith("#")) {
        finalColor = `#${themeColor}`;
      }

      // Create or update theme-color meta tag
      let metaTag = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("name", "theme-color");
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute("content", finalColor);

      console.log(`🍎 Dashboard iOS theme color: ${finalColor} (${resolvedTheme})`);
    };

    // Update immediately
    updateThemeColor();

    // Also update when DOM changes (theme class applied)
    const observer = new MutationObserver(() => {
      setTimeout(updateThemeColor, 50);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    return () => observer.disconnect();
  }, [resolvedTheme]);

  return null;
}

// Enhanced theme manager that adds proper coordinate-based transitions
function DashboardThemeManager({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  // Add enhanced global theme transition methods
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Enhanced smoothToggleTheme with proper coordinate handling
      (window as any).smoothToggleTheme = async (coordinates?: { x: number; y: number }) => {
        const themeChangeCallback = () => {
          theme.setTheme(theme.resolvedTheme === 'dark' ? 'light' : 'dark');
        };

        // Use enhanced transition with coordinates
        if (coordinates) {
          await transitionTheme(themeChangeCallback, coordinates);
        } else {
          await transitionTheme(themeChangeCallback);
        }
      };

      // Enhanced smoothSetTheme with proper coordinate handling
      (window as any).smoothSetTheme = async (newTheme: string, coordinates?: { x: number; y: number }) => {
        const themeChangeCallback = () => {
          theme.setTheme(newTheme);
        };

        // Use enhanced transition with coordinates
        if (coordinates) {
          await transitionTheme(themeChangeCallback, coordinates);
        } else {
          await transitionTheme(themeChangeCallback);
        }
      };

      // Add a method for smooth toggles with element reference
      (window as any).smoothToggleThemeFromElement = async (element: HTMLElement) => {
        const themeChangeCallback = () => {
          theme.setTheme(theme.resolvedTheme === 'dark' ? 'light' : 'dark');
        };

        await smoothThemeToggle(element, themeChangeCallback);
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).smoothToggleTheme;
        delete (window as any).smoothSetTheme;
        delete (window as any).smoothToggleThemeFromElement;
      }
    };
  }, [theme]);

  return (
    <>
      <DashboardThemeColorManager />
      {children}
    </>
  );
}

// Enhanced ThemeProvider wrapper with smooth transition support
function EnhancedThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <DashboardThemeManager>
        {children}
      </DashboardThemeManager>
    </ThemeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <EnhancedThemeProvider>
        {children}
      </EnhancedThemeProvider>
    </SidebarProvider>
  );
}