import type { ComponentType } from "react";
import UniqueMuslim, { type ThemeProps } from "./unique-muslim";

export type { ThemeProps };

export const themeRegistry: Record<string, ComponentType<ThemeProps>> = {
  "unique-muslim": UniqueMuslim,
};

export const FallbackTheme = UniqueMuslim;
