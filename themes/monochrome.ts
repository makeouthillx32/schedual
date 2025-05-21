// themes/monochrome.ts
import type { Theme } from '@/types/theme';
import { defaultFonts } from './fonts';
import { defaultRadii, defaultShadows, defaultTypography, getAllThemeVariables } from './utils';

// Monochrome theme based on your provided CSS variables
const monochromeTheme: Theme = {
  id: 'monochrome',
  name: 'Monochrome',
  description: 'A clean black and white theme with Architects Daughter font',
  previewColor: 'hsl(0 0% 20%)',
  
  // Font configuration (with Architects Daughter as sans-serif)
  fonts: {
    sans: 'Architects Daughter, sans-serif',
    serif: '"Times New Roman", Times, serif',
    mono: '"Courier New", Courier, monospace',
  },
  
  // Border radius
  radii: {
    radius: '0.625rem',
  },
  
  // Shadows
  shadows: defaultShadows,
  
  // Typography
  typography: {
    trackingNormal: '0.5px',
  },
  
  // Light mode variables
  light: {
    // Base colors
    '--background': '0 0% 97.65%',
    '--foreground': '0 0% 22.75%',
    '--card': '0 0% 100%',
    '--card-foreground': '0 0% 22.75%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '0 0% 22.75%',
    '--primary': '0 0% 37.65%',
    '--primary-foreground': '0 0% 94.12%',
    '--secondary': '0 0% 87.06%',
    '--secondary-foreground': '0 0% 22.75%',
    '--muted': '0 0% 89.02%',
    '--muted-foreground': '0 0% 31.37%',
    '--accent': '47.44 64.18% 86.86%',
    '--accent-foreground': '14.21 25.68% 29.02%',
    '--destructive': '0 41.49% 63.14%',
    '--destructive-foreground': '0 0% 100%',
    '--border': '0 0.87% 45.10%',
    '--input': '0 0% 100%',
    '--ring': '0 0% 62.75%',
    
    // Chart colors
    '--chart-1': '0 0% 20%',
    '--chart-2': '0 0% 33.33%',
    '--chart-3': '0 0% 46.67%',
    '--chart-4': '0 0% 60%',
    '--chart-5': '0 0% 73.33%',
    
    // Sidebar
    '--sidebar': '0 0% 94.12%',
    '--sidebar-foreground': '0 0% 22.75%',
    '--sidebar-primary': '0 0% 37.65%',
    '--sidebar-primary-foreground': '0 0% 94.12%',
    '--sidebar-accent': '47.44 64.18% 86.86%',
    '--sidebar-accent-foreground': '14.21 25.68% 29.02%',
    '--sidebar-border': '0 0% 75.29%',
    '--sidebar-ring': '0 0% 62.75%',
    
    // Add font, radii, shadow, and typography variables
    ...getAllThemeVariables(
      {
        sans: 'Architects Daughter, sans-serif',
        serif: '"Times New Roman", Times, serif',
        mono: '"Courier New", Courier, monospace',
      },
      { radius: '0.625rem' },
      defaultShadows,
      { trackingNormal: '0.5px' }
    ),
  },
  
  // Dark mode variables
  dark: {
    // Base colors
    '--background': '0 0% 16.86%',
    '--foreground': '0 0% 86.27%',
    '--card': '0 0% 20%',
    '--card-foreground': '0 0% 86.27%',
    '--popover': '0 0% 20%',
    '--popover-foreground': '0 0% 86.27%',
    '--primary': '0 0% 69.02%',
    '--primary-foreground': '0 0% 16.86%',
    '--secondary': '0 0% 35.29%',
    '--secondary-foreground': '0 0% 75.29%',
    '--muted': '0 0% 27.06%',
    '--muted-foreground': '0 0% 62.75%',
    '--accent': '0 0% 87.84%',
    '--accent-foreground': '0 0% 20%',
    '--destructive': '0 35.59% 76.86%',
    '--destructive-foreground': '0 0% 16.86%',
    '--border': '0 0% 30.98%',
    '--input': '0 0% 20%',
    '--ring': '0 0% 75.29%',
    
    // Chart colors
    '--chart-1': '0 0% 93.73%',
    '--chart-2': '0 0% 81.57%',
    '--chart-3': '0 0% 69.02%',
    '--chart-4': '0 0% 56.47%',
    '--chart-5': '0 0% 43.92%',
    
    // Sidebar
    '--sidebar': '0 0% 12.94%',
    '--sidebar-foreground': '0 0% 86.27%',
    '--sidebar-primary': '0 0% 69.02%',
    '--sidebar-primary-foreground': '0 0% 12.94%',
    '--sidebar-accent': '0 0% 87.84%',
    '--sidebar-accent-foreground': '0 0% 20%',
    '--sidebar-border': '0 0% 30.98%',
    '--sidebar-ring': '0 0% 75.29%',
    
    // Add font, radii, shadow, and typography variables
    ...getAllThemeVariables(
      {
        sans: 'Architects Daughter, sans-serif',
        serif: 'Georgia, serif',
        mono: '"Fira Code", "Courier New", monospace',
      },
      { radius: '0.625rem' },
      defaultShadows,
      { trackingNormal: '0.5px' }
    ),
  }
};

export default monochromeTheme;