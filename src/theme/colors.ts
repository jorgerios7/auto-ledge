import { Appearance, ColorSchemeName } from 'react-native';

export type AppColorScheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceCard: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textSecondary: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  accentDark: string;
  error: string;
  errorSurface: string;
  warning: string;
  warningSurface: string;
  success: string;
  successSurface: string;
  info: string;
  infoSurface: string;
  darkGray: string;
  mediumGray: string;
  lightGray: string;
  disabled: string;
  disabledText: string;
  tabBarBg: string;
  overlay: string;
  carBgContainer: string;
  carChassisBorder: string;
}

export const lightColors: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceCard: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E5E7EB',
  borderStrong: '#CBD5E1',
  text: '#111827',
  textMuted: '#6B7280',
  textSecondary: '#9CA3AF',
  primary: '#0F3D5E',
  primaryHover: '#0C3251',
  secondary: '#E8EEF4',
  accent: '#10B981',
  accentDark: '#0A9668',
  error: '#DC2626',
  errorSurface: '#FEF2F2',
  warning: '#D97706',
  warningSurface: '#FFFBEB',
  success: '#059669',
  successSurface: '#ECFDF5',
  info: '#2563EB',
  infoSurface: '#EFF6FF',
  darkGray: '#1F2937',
  mediumGray: '#CBD5E1',
  lightGray: '#E5E7EB',
  disabled: '#E5E7EB',
  disabledText: '#94A3B8',
  tabBarBg: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.48)',
  carBgContainer: '#EEF4F8',
  carChassisBorder: '#2563EB',
};

export const darkColors: ThemeColors = {
  background: '#07111D',
  surface: '#0D1B2A',
  surfaceCard: '#102235',
  surfaceElevated: '#142B42',
  border: '#243448',
  borderStrong: '#33465F',
  text: '#F8FAFC',
  textMuted: '#A8B3C2',
  textSecondary: '#718096',
  primary: '#93C5FD',
  primaryHover: '#BFDBFE',
  secondary: '#172A3D',
  accent: '#34D399',
  accentDark: '#6EE7B7',
  error: '#F87171',
  errorSurface: '#3B1519',
  warning: '#FBBF24',
  warningSurface: '#3A2A0A',
  success: '#34D399',
  successSurface: '#102E24',
  info: '#60A5FA',
  infoSurface: '#10233D',
  darkGray: '#111827',
  mediumGray: '#334155',
  lightGray: '#64748B',
  disabled: '#1E293B',
  disabledText: '#64748B',
  tabBarBg: '#0B1624',
  overlay: 'rgba(2, 6, 23, 0.72)',
  carBgContainer: '#0B1624',
  carChassisBorder: '#60A5FA',
};

export function normalizeColorScheme(scheme: ColorSchemeName): AppColorScheme {
  return scheme === 'dark' ? 'dark' : 'light';
}

export function getColorsForScheme(scheme: ColorSchemeName): ThemeColors {
  return normalizeColorScheme(scheme) === 'dark' ? darkColors : lightColors;
}

export const colors = getColorsForScheme(Appearance.getColorScheme());
export const themeColors = colors;
