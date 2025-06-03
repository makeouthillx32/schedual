// utils/themeTransitions.ts
"use client";

/**
 * Smooth theme transition with circular reveal animation
 * Uses the View Transitions API when available
 */

interface TransitionOptions {
  x?: number;
  y?: number;
  duration?: number;
  element?: HTMLElement;
}

/**
 * Set the origin point for the circular transition
 */
function setTransitionOrigin(x: number, y: number) {
  const root = document.documentElement;
  root.style.setProperty('--theme-x', `${x}px`);
  root.style.setProperty('--theme-y', `${y}px`);
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
 * Main theme transition function
 * @param themeChangeCallback - Function that actually changes the theme
 * @param options - Transition options including origin coordinates
 */
export async function transitionTheme(
  themeChangeCallback: () => void | Promise<void>,
  options: TransitionOptions = {}
): Promise<void> {
  // Check if View Transitions API is supported
  if (!('startViewTransition' in document)) {
    console.log('🔄 View Transitions not supported, using fallback');
    await themeChangeCallback();
    return;
  }

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

    console.log(`🎨 Starting theme transition from (${x}, ${y})`);

    // Start the view transition
    const transition = (document as any).startViewTransition(async () => {
      await themeChangeCallback();
    });

    // Wait for transition to complete
    await transition.finished;
    
    console.log('✨ Theme transition completed');

  } catch (error) {
    console.error('❌ Theme transition failed:', error);
    // Fallback to regular theme change
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
 * Check if View Transitions are supported
 */
export function isViewTransitionsSupported(): boolean {
  return typeof window !== 'undefined' && 'startViewTransition' in document;
}

/**
 * Utility to enhance any theme toggle button with smooth transitions
 * @param buttonSelector - CSS selector for theme toggle buttons
 * @param themeChangeCallback - Function to change theme
 */
export function enhanceThemeButtons(
  buttonSelector: string,
  themeChangeCallback: (element: HTMLElement) => void | Promise<void>
): void {
  if (typeof window === 'undefined') return;

  const buttons = document.querySelectorAll(buttonSelector);
  
  buttons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      await smoothThemeToggle(
        button as HTMLElement,
        () => themeChangeCallback(button as HTMLElement)
      );
    });
  });
}