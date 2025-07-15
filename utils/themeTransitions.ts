// Enhanced Theme Transition System with Mobile Fix
"use client";

/**
 * Enhanced theme transitions with proper mobile support
 * Fixes the issue where animations start from center instead of button position
 */

interface ThemeToggleOptions {
  x?: number;
  y?: number;
}

/**
 * Set animation origin coordinates with mobile adjustments
 */
function setThemeOrigin(x: number, y: number) {
  // Clamp coordinates to ensure they're within viewport bounds
  const clampedX = Math.max(0, Math.min(x, window.innerWidth));
  const clampedY = Math.max(0, Math.min(y, window.innerHeight));
  
  document.documentElement.style.setProperty('--x', `${clampedX}px`);
  document.documentElement.style.setProperty('--y', `${clampedY}px`);
  
  // Debug logging for mobile troubleshooting
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 Animation origin set: (${clampedX}, ${clampedY})`);
    console.log(`📱 Viewport: ${window.innerWidth}x${window.innerHeight}`);
  }
}

/**
 * Get accurate element coordinates with mobile viewport handling
 */
function getElementCoordinates(element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  
  // Get the center of the element
  const x = rect.left + (rect.width / 2);
  const y = rect.top + (rect.height / 2);
  
  // Account for page scroll (important on mobile)
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  
  return {
    x: x + scrollX,
    y: y + scrollY
  };
}

/**
 * Enhanced theme transition with better mobile support
 */
export async function transitionTheme(
  themeCallback: () => void | Promise<void>,
  coordinates?: ThemeToggleOptions
): Promise<void> {
  // Set animation origin
  if (coordinates) {
    setThemeOrigin(coordinates.x!, coordinates.y!);
  } else {
    // Default to center if no coordinates provided
    setThemeOrigin(window.innerWidth / 2, window.innerHeight / 2);
  }

  // Check for View Transitions support
  if (!document.startViewTransition) {
    await themeCallback();
    return;
  }

  // Start the transition
  const transition = document.startViewTransition(async () => {
    await themeCallback();
  });

  await transition.finished;
}

/**
 * Enhanced smooth theme toggle for buttons with proper mobile coordinate detection
 */
export async function smoothThemeToggle(
  element: HTMLElement,
  themeCallback: () => void | Promise<void>
): Promise<void> {
  // Get accurate coordinates accounting for mobile viewport and scrolling
  const coords = getElementCoordinates(element);
  
  await transitionTheme(themeCallback, coords);
}

/**
 * Enhanced click handler for theme toggle buttons
 * Use this in your click handlers for the most accurate coordinates
 */
export async function handleThemeToggleClick(
  event: React.MouseEvent<HTMLElement>,
  themeCallback: () => void | Promise<void>
): Promise<void> {
  // Use click coordinates if available (most accurate)
  const { clientX, clientY } = event;
  
  // Account for scroll position
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  
  const coordinates = {
    x: clientX + scrollX,
    y: clientY + scrollY
  };
  
  await transitionTheme(themeCallback, coordinates);
}

/**
 * Global theme toggle method for use with window object
 * This is what your dashboard providers call
 */
export function setupGlobalThemeTransitions() {
  if (typeof window !== 'undefined') {
    // Enhanced smoothToggleTheme that properly handles coordinates
    (window as any).smoothToggleTheme = async (coordinates?: { x: number; y: number }) => {
      // This should be overridden by the actual theme provider
      console.warn('🚨 smoothToggleTheme called but no theme provider found');
    };
    
    // Enhanced smoothSetTheme that properly handles coordinates  
    (window as any).smoothSetTheme = async (newTheme: string, coordinates?: { x: number; y: number }) => {
      // This should be overridden by the actual theme provider
      console.warn('🚨 smoothSetTheme called but no theme provider found');
    };
  }
}

/**
 * Cleanup global theme transition methods
 */
export function cleanupGlobalThemeTransitions() {
  if (typeof window !== 'undefined') {
    delete (window as any).smoothToggleTheme;
    delete (window as any).smoothSetTheme;
  }
}

/**
 * Hook for getting theme toggle handler with proper coordinates
 */
export function useThemeToggleHandler(toggleTheme: (element?: HTMLElement) => Promise<void>) {
  return async (event: React.MouseEvent<HTMLElement>) => {
    // Use the enhanced click handler
    await handleThemeToggleClick(event, async () => {
      await toggleTheme(event.currentTarget);
    });
  };
}