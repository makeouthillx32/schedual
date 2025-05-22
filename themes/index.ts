// themes/index.ts
import type { Theme } from '@/types/theme';
import defaultTheme from './default';
import monochromeTheme from './monochrome';

export const themes: Theme[] = [
  defaultTheme,
  monochromeTheme,
];

export const themeMap: Record<string, Theme> = 
  Object.fromEntries(themes.map(theme => [theme.id, theme]));

export const defaultThemeId = 'default';