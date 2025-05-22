// themes/index.ts
// themes/index.ts
import type { Theme } from '@/types/theme';
import defaultTheme from './default';
import monochromeTheme from './monochrome';
import sharpTheme from './sharp';
import vintageTheme from './vintage';  // <- Add this import

export const themes: Theme[] = [
  defaultTheme,
  monochromeTheme,
  sharpTheme,
  vintageTheme,  // <- Add this to array
];

export const themeMap: Record<string, Theme> = 
  Object.fromEntries(themes.map(theme => [theme.id, theme]));

export const defaultThemeId = 'default';