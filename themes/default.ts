// themes/default.ts
import type { Theme } from '@/types/theme';
import { defaultFonts } from './fonts';
import { defaultRadii, defaultShadows, defaultTypography, getAllThemeVariables } from './utils';

const defaultTheme: Theme = {
  id: 'default',
  name: 'Default',
  description: 'The default application theme',
  previewColor: 'hsl(139.66 52.73% 43.14%)',
  
  // Font configuration
  fonts: defaultFonts,
  
  // Border radius
  radii: defaultRadii,
  
  // Shadows
  shadows: defaultShadows,
  
  // Typography
  typography: defaultTypography,
  
  // Light mode variables (from your current CSS)
  light: {
    '--background': '240 9.09% 97.84%',
    '--foreground': '0 0% 20%',
    '--card': '0 0% 100%',
    '--card-foreground': '0 0% 20%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '0 0% 20%',
    '--primary': '139.66 52.73% 43.14%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '218.54 79.19% 66.08%',
    '--secondary-foreground': '0 0% 100%',
    '--muted': '50.40 26.88% 81.76%',
    '--muted-foreground': '0 0% 43.14%',
    '--accent': '189.64 81.07% 66.86%',
    '--accent-foreground': '0 0% 20%',
    '--destructive': '0 84.24% 60.20%',
    '--destructive-foreground': '0 0% 100%',
    '--border': '0 0% 83.14%',
    '--input': '0 0% 83.14%',
    '--ring': '139.66 52.73% 43.14%',
    '--chart-1': '139.66 52.73% 43.14%',
    '--chart-2': '218.54 79.19% 66.08%',
    '--chart-3': '189.64 81.07% 66.86%',
    '--chart-4': '207.27 44% 49.02%',
    '--chart-5': '138.87 70.45% 34.51%',
    '--sidebar': '240 9.09% 97.84%',
    '--sidebar-foreground': '0 0% 20%',
    '--sidebar-primary': '139.66 52.73% 43.14%',
    '--sidebar-primary-foreground': '0 0% 100%',
    '--sidebar-accent': '189.64 81.07% 66.86%',
    '--sidebar-accent-foreground': '0 0% 20%',
    '--sidebar-border': '0 0% 83.14%',
    '--sidebar-ring': '139.66 52.73% 43.14%',
    
    // Add font, radii, shadow, and typography variables
    ...getAllThemeVariables(defaultFonts, defaultRadii, defaultShadows, defaultTypography),
  },
  
  // Dark mode variables (from your current CSS)
  dark: {
    '--background': '220.00 14.75% 11.96%',
    '--foreground': '0 0% 89.80%',
    '--card': '197.14 6.93% 19.80%',
    '--card-foreground': '0 0% 89.80%',
    '--popover': '197.14 6.93% 19.80%',
    '--popover-foreground': '0 0% 89.80%',
    '--primary': '139.66 52.73% 43.14%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '207.27 44% 49.02%',
    '--secondary-foreground': '0 0% 89.80%',
    '--muted': '0 0% 26.67%',
    '--muted-foreground': '0 0% 63.92%',
    '--accent': '218.54 79.19% 66.08%',
    '--accent-foreground': '0 0% 89.80%',
    '--destructive': '0 84.24% 60.20%',
    '--destructive-foreground': '0 0% 100%',
    '--border': '0 0% 26.67%',
    '--input': '0 0% 26.67%',
    '--ring': '139.66 52.73% 43.14%',
    '--chart-1': '139.66 52.73% 43.14%',
    '--chart-2': '207.27 44% 49.02%',
    '--chart-3': '218.54 79.19% 66.08%',
    '--chart-4': '189.64 81.07% 66.86%',
    '--chart-5': '138.87 70.45% 34.51%',
    '--sidebar': '220.00 14.75% 11.96%',
    '--sidebar-foreground': '0 0% 89.80%',
    '--sidebar-primary': '139.66 52.73% 43.14%',
    '--sidebar-primary-foreground': '0 0% 100%',
    '--sidebar-accent': '218.54 79.19% 66.08%',
    '--sidebar-accent-foreground': '0 0% 89.80%',
    '--sidebar-border': '0 0% 26.67%',
    '--sidebar-ring': '139.66 52.73% 43.14%',
    
    // Add font, radii, shadow, and typography variables
    ...getAllThemeVariables(defaultFonts, defaultRadii, defaultShadows, defaultTypography),
  }
};

export default defaultTheme;