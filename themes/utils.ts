// themes/utils.ts
import { ThemeFonts, ThemeRadii, ThemeShadows, ThemeTypography } from "@/types/theme";

/**
 * Converts theme properties to CSS variables
 */

// Font utilities
export const getFontVariables = (fonts: ThemeFonts): Record<string, string> => {
  return {
    '--font-sans': fonts.sans,
    '--font-serif': fonts.serif,
    '--font-mono': fonts.mono,
  };
};

// Border radius utilities
export const getRadiiVariables = (radii: ThemeRadii): Record<string, string> => {
  return {
    '--radius': radii.radius,
  };
};

// Shadow utilities
export const getShadowVariables = (shadows: ThemeShadows): Record<string, string> => {
  return {
    '--shadow-2xs': shadows.shadow2xs,
    '--shadow-xs': shadows.shadowXs,
    '--shadow-sm': shadows.shadowSm,
    '--shadow': shadows.shadow,
    '--shadow-md': shadows.shadowMd,
    '--shadow-lg': shadows.shadowLg,
    '--shadow-xl': shadows.shadowXl,
    '--shadow-2xl': shadows.shadow2xl,
  };
};

// Typography utilities
export const getTypographyVariables = (typography?: ThemeTypography): Record<string, string> => {
  if (!typography) return {};
  
  const variables: Record<string, string> = {};
  
  if (typography.trackingNormal) {
    variables['--tracking-normal'] = typography.trackingNormal;
  }
  
  return variables;
};

// Combine all theme variables
export const getAllThemeVariables = (
  fonts: ThemeFonts,
  radii: ThemeRadii,
  shadows: ThemeShadows,
  typography?: ThemeTypography
): Record<string, string> => {
  return {
    ...getFontVariables(fonts),
    ...getRadiiVariables(radii),
    ...getShadowVariables(shadows),
    ...getTypographyVariables(typography),
  };
};

// Default values
export const defaultRadii: ThemeRadii = {
  radius: '0.5rem',
};

export const defaultShadows: ThemeShadows = {
  shadow2xs: '1px 4px 5px 0px hsl(0 0% 0% / 0.01)',
  shadowXs: '1px 4px 5px 0px hsl(0 0% 0% / 0.01)',
  shadowSm: '1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 1px 2px -1px hsl(0 0% 0% / 0.03)',
  shadow: '1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 1px 2px -1px hsl(0 0% 0% / 0.03)',
  shadowMd: '1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 2px 4px -1px hsl(0 0% 0% / 0.03)',
  shadowLg: '1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 4px 6px -1px hsl(0 0% 0% / 0.03)',
  shadowXl: '1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 8px 10px -1px hsl(0 0% 0% / 0.03)',
  shadow2xl: '1px 4px 5px 0px hsl(0 0% 0% / 0.07)',
};

export const defaultTypography: ThemeTypography = {
  trackingNormal: '0.5px',
};