"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

/**
 * ThemeProvider component that wraps the application with a theme provider.
 *
 * This component uses `next-themes` to provide a flexible theme management
 * system, allowing for easy theme switching and customization.
 *
 * @param {ThemeProviderProps} props - The properties passed to the ThemeProvider.
 * @param {React.ReactNode} children - The child components that will be wrapped
 *                                     by the ThemeProvider.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}