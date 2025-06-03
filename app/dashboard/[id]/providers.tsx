// app/dashboard/[id]/providers.tsx
"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { useTheme } from "next-themes";

// Enhanced theme manager for dashboard with smooth transitions
function DashboardThemeColorManager() {
  const { resolvedTheme } = useTheme();

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
        themeColor = computedStyle.getPropertyValue("--background").trim();
      } else {
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

// Theme manager that adds TweakCN-style circular transition support
function DashboardThemeManager({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  // Add TweakCN-style circular transition methods to the window
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // TweakCN-style theme toggle with coordinates
      (window as any).smoothToggleTheme = async (coordinates?: { x: number; y: number }) => {
        const themeChangeCallback = () => {
          theme.setTheme(theme.resolvedTheme === 'dark' ? 'light' : 'dark');
        };

        // Set animation origin coordinates (TweakCN style)
        if (coordinates) {
          document.documentElement.style.setProperty('--x', `${coordinates.x}px`);
          document.documentElement.style.setProperty('--y', `${coordinates.y}px`);
          console.log(`🎯 Setting animation origin: (${coordinates.x}, ${coordinates.y})`);
        } else {
          // Default to center
          document.documentElement.style.setProperty('--x', `${window.innerWidth / 2}px`);
          document.documentElement.style.setProperty('--y', `${window.innerHeight / 2}px`);
        }

        // Start the view transition (TweakCN approach)
        if (document.startViewTransition) {
          console.log('🎨 Starting view transition...');
          const transition = document.startViewTransition(async () => {
            await themeChangeCallback();
          });
          await transition.finished;
          console.log('✨ View transition completed');
        } else {
          console.log('⚠️ View transitions not supported, using fallback');
          await themeChangeCallback();
        }
      };

      // TweakCN-style theme setter with coordinates
      (window as any).smoothSetTheme = async (newTheme: string, coordinates?: { x: number; y: number }) => {
        const themeChangeCallback = () => {
          theme.setTheme(newTheme);
        };

        // Set animation origin coordinates
        if (coordinates) {
          document.documentElement.style.setProperty('--x', `${coordinates.x}px`);
          document.documentElement.style.setProperty('--y', `${coordinates.y}px`);
        } else {
          document.documentElement.style.setProperty('--x', `${window.innerWidth / 2}px`);
          document.documentElement.style.setProperty('--y', `${window.innerHeight / 2}px`);
        }

        // Start the view transition
        if (document.startViewTransition) {
          const transition = document.startViewTransition(async () => {
            await themeChangeCallback();
          });
          await transition.finished;
        } else {
          await themeChangeCallback();
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
    <EnhancedThemeProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </EnhancedThemeProvider>
  );
}