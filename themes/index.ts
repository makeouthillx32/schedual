// themes/index.ts
import type { Theme } from '@/types/theme';

// Import all themes
import defaultTheme from './default';
import monochromeTheme from './monochrome';

// Export as array for iteration
export const themes: Theme[] = [
  defaultTheme,
  monochromeTheme, // Add the new monochrome theme
  // Add new themes here
];

// Export as record for direct access
export const themeMap: Record<string, Theme> = 
  Object.fromEntries(themes.map(theme => [theme.id, theme]));

// Export default theme ID
export const defaultThemeId = 'default';