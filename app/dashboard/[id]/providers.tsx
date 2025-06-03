// app/dashboard/[id]/providers.tsx
"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { transitionTheme, smoothThemeToggle } from "@/utils/themeTransitions";

// Enhanced theme manager for dashboard with smooth transitions
function DashboardThemeColorManager() {
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const updateThemeColor = () => {
      if (typeof window === "undefined") return;

      // Remove existing theme-color meta tags
      document.querySelectorAll('meta[name="theme-color"]').forEach(el => el.remove());

      // Get computed background color from CSS variables
      const html = document.documentElement;
      const computedStyle = getComputedStyle(html);
      
      let themeColor;
      if (resolvedTheme === "dark") {
        // For dashboard dark mode, use background
        themeColor = computedStyle.getPropertyValue("--background").trim();
      } else {
        // For dashboard light mode, use background
        themeColor = computedStyle.getPropertyValue("--background").trim();
      }

      // Fallback colors if CSS variable not available
      if (!themeColor) {
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

      // Create theme-color meta tag
      const metaTag = document.createElement("meta");
      metaTag.setAttribute("name", "theme-color");
      metaTag.setAttribute("content", finalColor);
      document.head.appendChild(metaTag);

      // Create media-specific meta tags for better iOS support
      const metaLight = document.createElement("meta");
      metaLight.setAttribute("name", "theme-color");
      metaLight.setAttribute("media", "(prefers-color-scheme: light)");
      metaLight.setAttribute("content", resolvedTheme === "light" ? finalColor : "#ffffff");
      document.head.appendChild(metaLight);

      const metaDark = document.createElement("meta");
      metaDark.setAttribute("name", "theme-color");
      metaDark.setAttribute("media", "(prefers-color-scheme: dark)");
      metaDark.setAttribute("content", resolvedTheme === "dark" ? finalColor : "#111827");
      document.head.appendChild(metaDark);

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

// Theme manager that adds smooth transition support to next-themes
function DashboardThemeManager({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  // Add smooth transition methods to the window for global access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Enhanced theme toggle for dashboard
      (window as any).smoothToggleTheme = async (element?: HTMLElement) => {
        const themeChangeCallback = () => {
          theme.setTheme(theme.resolvedTheme === 'dark' ? 'light' : 'dark');
        };

        if (element) {
          await smoothThemeToggle(element, themeChangeCallback);
        } else {
          await transitionTheme(themeChangeCallback);
        }
      };

      // Enhanced theme setter for dashboard
      (window as any).smoothSetTheme = async (newTheme: string, element?: HTMLElement) => {
        const themeChangeCallback = () => {
          theme.setTheme(newTheme);
        };

        if (element) {
          await smoothThemeToggle(element, themeChangeCallback);
        } else {
          await transitionTheme(themeChangeCallback);
        }
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).smoothToggleTheme;
        delete (window as any).smoothSetTheme;
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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EnhancedThemeProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </EnhancedThemeProvider>
  );
}