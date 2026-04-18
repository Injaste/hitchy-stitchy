import type { ComponentType } from "react";
import ClassicMalay, { type ThemeProps } from "./classic-malay";

export type { ThemeProps };

export const themeRegistry: Record<string, ComponentType<ThemeProps>> = {
  "classic-malay": ClassicMalay,
};

export const FallbackTheme = ClassicMalay;
