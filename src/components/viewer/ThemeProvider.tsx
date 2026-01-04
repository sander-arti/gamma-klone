/**
 * ThemeProvider Component
 *
 * Provides theme context to child components by applying CSS custom properties.
 * Supports theme switching and brand kit overrides.
 */

"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  getTheme,
  themeToCssVars,
  applyBrandKit,
  type Theme,
  type ThemeId,
  type BrandKitOverrides,
} from "@/lib/themes";

interface ThemeContextValue {
  theme: Theme;
  themeId: ThemeId;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  themeId?: ThemeId;
  brandKit?: BrandKitOverrides;
  className?: string;
}

/**
 * ThemeProvider applies theme CSS variables to its children.
 *
 * @param themeId - The theme to use (defaults to "nordic_light")
 * @param brandKit - Optional brand kit overrides for primary/secondary colors
 * @param className - Additional CSS classes for the wrapper
 */
export function ThemeProvider({
  children,
  themeId = "nordic_light",
  brandKit,
  className = "",
}: ThemeProviderProps) {
  // Get base theme and apply brand kit overrides
  const theme = useMemo(() => {
    const baseTheme = getTheme(themeId);
    return applyBrandKit(baseTheme, brandKit);
  }, [themeId, brandKit]);

  // Convert theme tokens to CSS custom properties
  const cssVars = useMemo(() => themeToCssVars(theme.tokens), [theme.tokens]);

  // Create inline style object from CSS vars
  const style = useMemo(() => {
    const styleObj: Record<string, string> = {};
    for (const [key, value] of Object.entries(cssVars)) {
      styleObj[key] = value;
    }
    return styleObj;
  }, [cssVars]);

  const contextValue = useMemo(
    () => ({
      theme,
      themeId,
    }),
    [theme, themeId]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        style={{
          ...style,
          backgroundColor: "var(--theme-color-background, #f8fafc)",
          color: "var(--theme-color-foreground, #0f172a)",
        }}
        className={`w-full h-full ${className}`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the current theme context.
 * Must be used within a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
