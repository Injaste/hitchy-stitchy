import type { ComponentType } from "react";
import UniqueMuslim, { type ThemeProps } from "./unique-muslim";
import type { UniqueMuslimPageConfig } from "./unique-muslim/types";

export type { ThemeProps, UniqueMuslimPageConfig };

export interface ThemePageMeta {
  _theme_slug?: string | null;
}

export type ThemePageConfig = ThemePageMeta & UniqueMuslimPageConfig;

export const themeRegistry: Record<string, ComponentType<ThemeProps>> = {
  "unique-muslim": UniqueMuslim,
};

export const FallbackTheme = UniqueMuslim;
