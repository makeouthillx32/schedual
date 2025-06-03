// utils/themeTransitions.ts - TweakCN Style Implementation
"use client";

/**
 * TweakCN-style theme transitions with coordinates
 */

interface ThemeToggleOptions {
  x?: number;
  y?: number;
}

/**
 * Set click coordinates for the circular animation
 */
function setThemeOrigin(x: number, y: number) {
  document.documentElement.style.setProperty('--x', `${x}px`);
  document.documentElement.style.setProperty('--y', `${y}px`);
}

/**
 * TweakCN-style theme transition
 * @param themeCallback - Function that changes the theme
 * @param coordinates - Optional x,y coordinates for animation origin
 */
export async function transitionTheme(
  themeCallback: () => void | Promise<void>,
  coordinates?: ThemeToggleOptions
): Promise<void> {
  // Set animation origin (default to center if no coordinates)
  const x = coordinates?.x ?? window.innerWidth / 2;
  const y = coordinates?.y ?? window.innerHeight / 2;
  
  setThemeOrigin(x, y);

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
 * TweakCN-style smooth theme toggle (for button clicks)
 * @param element - Button element that was clicked
 * @param themeCallback - Function that changes the theme
 */
export async function smoothThemeToggle(
  element: HTMLElement,
  themeCallback: () => void | Promise<void>
): Promise<void> {
  // Get click coordinates from element center
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  
  await transitionTheme(themeCallback, { x, y });
}