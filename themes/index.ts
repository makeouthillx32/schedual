// themes/index.ts
import type { Theme } from '@/types/theme';
import defaultTheme from './default';
import monochromeTheme from './monochrome';
import sharpTheme from './sharp';
import vintageTheme from './vintage';

// Add preview colors to each theme
const themesWithPreview: Theme[] = [
  { ...defaultTheme, previewColor: 'hsl(var(--primary))' },
  { ...monochromeTheme, previewColor: 'hsl(var(--primary))' },
  { ...sharpTheme, previewColor: 'hsl(var(--primary))' },
  { ...vintageTheme, previewColor: 'hsl(var(--primary))' },
];

export const themes: Theme[] = themesWithPreview;

export const themeMap: Record<string, Theme> = 
  Object.fromEntries(themes.map(theme => [theme.id, theme]));

export const defaultThemeId = 'default';