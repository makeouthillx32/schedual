// utils/themeTransitions.ts
"use client";

/**
 * Simple theme transition with circular reveal animation
 * Similar to TweakCN's approach - no View Transitions API needed
 */

interface TransitionOptions {
  x?: number;
  y?: number;
  element?: HTMLElement;
}

/**
 * Set the origin point for the circular transition
 */
function setTransitionOrigin(x: number, y: number) {
  const root = document.documentElement;
  root.style.setProperty('--x', `${x}px`);
  root.style.setProperty('--y', `${y}px`);
}

/**
 * Get click coordinates from an element (like theme toggle button)
 */
function getElementCenter(element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}

/**
 * Simple theme transition - just set origin and change theme
 * The CSS animation will handle the rest automatically
 */
export async function transitionTheme(
  themeChangeCallback: () => void | Promise<void>,
  options: TransitionOptions = {}
): Promise<void> {
  try {
    // Get transition origin coordinates
    let x = options.x ?? window.innerWidth / 2;
    let y = options.y ?? window.innerHeight / 2;

    // If element provided, use its center as origin
    if (options.element) {
      const center = getElementCenter(options.element);
      x = center.x;
      y = center.y;
    }

    // Set CSS variables for animation origin
    setTransitionOrigin(x, y);

    console.log(`🎨 Setting theme transition origin at (${x}, ${y})`);

    // Execute the theme change - CSS will handle the animation
    await themeChangeCallback();
    
    console.log('✨ Theme changed - CSS animation should be running');

  } catch (error) {
    console.error('❌ Theme transition failed:', error);
    // Still execute the theme change even if coordinate setting failed
    await themeChangeCallback();
  }
}

/**
 * Enhanced theme toggle for buttons with smooth transition
 * @param element - The button element that was clicked
 * @param themeChangeCallback - Function to change theme
 */
export async function smoothThemeToggle(
  element: HTMLElement,
  themeChangeCallback: () => void | Promise<void>
): Promise<void> {
  await transitionTheme(themeChangeCallback, { element });
}

/**
 * Theme transition from specific coordinates (useful for custom triggers)
 * @param x - X coordinate for transition origin
 * @param y - Y coordinate for transition origin
 * @param themeChangeCallback - Function to change theme
 */
export async function transitionThemeFromPoint(
  x: number,
  y: number,
  themeChangeCallback: () => void | Promise<void>
): Promise<void> {
  await transitionTheme(themeChangeCallback, { x, y });
}

/**
 * Simple coordinate-based theme toggle (TweakCN style)
 * @param element - Element that was clicked
 * @param themeChangeCallback - Function to change theme
 */
export function simpleThemeToggle(
  element: HTMLElement,
  themeChangeCallback: () => void
): void {
  // Get click position
  const center = getElementCenter(element);
  
  // Set origin for animation
  setTransitionOrigin(center.x, center.y);
  
  // Change theme - CSS animation will run automatically
  themeChangeCallback();
  
  console.log(`🎨 Theme toggled from (${center.x}, ${center.y})`);
}

/**
 * Utility to enhance any theme toggle button with simple transitions
 * @param buttonSelector - CSS selector for theme toggle buttons
 * @param themeChangeCallback - Function to change theme
 */
export function enhanceThemeButtons(
  buttonSelector: string,
  themeChangeCallback: (element: HTMLElement) => void
): void {
  if (typeof window === 'undefined') return;

  const buttons = document.querySelectorAll(buttonSelector);
  
  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      simpleThemeToggle(
        button as HTMLElement,
        () => themeChangeCallback(button as HTMLElement)
      );
    });
  });
}