import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { useColorScheme, useWindowDimensions } from 'react-native';
import {
  AppColorScheme,
  getColorsForScheme,
  normalizeColorScheme,
  ThemeColors,
} from './colors';

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  pill: number;
}

export interface ThemeTypography {
  title: number;
  subtitle: number;
  body: number;
  bodySmall: number;
  caption: number;
  micro: number;
}

export interface AppTheme {
  mode: AppColorScheme;
  isDark: boolean;
  colors: ThemeColors;
  fontScale: number;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  typography: ThemeTypography;
}

const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const radius: ThemeRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
};

const typography: ThemeTypography = {
  title: 24,
  subtitle: 18,
  body: 15,
  bodySmall: 13,
  caption: 12,
  micro: 10,
};

const ThemeContext = createContext<AppTheme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const { fontScale } = useWindowDimensions();

  const theme = useMemo<AppTheme>(() => {
    const mode = normalizeColorScheme(systemScheme);

    return {
      mode,
      isDark: mode === 'dark',
      colors: getColorsForScheme(mode),
      fontScale,
      spacing,
      radius,
      typography,
    };
  }, [fontScale, systemScheme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return theme;
}
