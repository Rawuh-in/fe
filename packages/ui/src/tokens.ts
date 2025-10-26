export const colorTokens = {
  primary: "var(--eo-primary)",
  primaryContrast: "var(--eo-primary-contrast)",
  success: "var(--eo-success)",
  warning: "var(--eo-warning)",
  warningStrong: "var(--eo-warning-strong)",
  danger: "var(--eo-danger)",
  muted: "var(--eo-muted)",
  mutedText: "var(--eo-muted-text)",
  background: "var(--eo-bg)",
  foreground: "var(--eo-fg)",
  backgroundElevated: "var(--eo-bg-elevated)",
  focus: "var(--eo-focus)"
} as const;

export const radiusTokens = {
  sm: "var(--eo-radius-sm)",
  md: "var(--eo-radius-md)",
  lg: "var(--eo-radius-lg)"
} as const;

export const shadowTokens = {
  xs: "var(--eo-shadow-xs)",
  sm: "var(--eo-shadow-sm)",
  md: "var(--eo-shadow-md)"
} as const;

export const spaceTokens = {
  1: "var(--eo-space-1)",
  2: "var(--eo-space-2)",
  3: "var(--eo-space-3)",
  4: "var(--eo-space-4)",
  5: "var(--eo-space-5)",
  6: "var(--eo-space-6)",
  7: "var(--eo-space-7)"
} as const;

export const typeScaleTokens = {
  xs: "var(--eo-text-xs)",
  sm: "var(--eo-text-sm)",
  md: "var(--eo-text-md)",
  lg: "var(--eo-text-lg)",
  xl: "var(--eo-text-xl)",
  xxl: "var(--eo-text-xxl)"
} as const;

export const tokens = {
  colors: colorTokens,
  radius: radiusTokens,
  shadows: shadowTokens,
  spacing: spaceTokens,
  typeScale: typeScaleTokens
} as const;

export type TokenGroup = typeof tokens;
