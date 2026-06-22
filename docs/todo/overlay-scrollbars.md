# Handover: OverlayScrollbars custom theme not applying

**Status:** scrollbars are currently **invisible app-wide**. The library works; our
custom theme's CSS variables don't apply. Root cause narrowed; not yet fixed.

## Goal
Global macOS/mobile-style overlay scrollbars (thin, auto-hiding, reserve no
space), consistent across OS/browser. Library: **OverlayScrollbars**
(`overlayscrollbars@^2.16.0` + `overlayscrollbars-react@^0.5.6`, already installed).

## Where it's wired
- **`src/components/custom/scroll-view.tsx`** — `ScrollView` renders
  `<OverlayScrollbarsComponent>` unconditionally. Options:
  `overflow: { x:"hidden", y:"scroll" }`, `scrollbars: { autoHide:"leave",
  autoHideDelay:600, theme:"os-theme-app" }`. Gradient fades read scroll state
  from `inst.elements().viewport` via the `initialized/updated/scroll` events.
  CSS imported here: `import "overlayscrollbars/overlayscrollbars.css"`
  (resolves to `styles/overlayscrollbars.css` ✓). Has a `size?: "thin"|"normal"`
  prop that adds the `os-scroll-normal` class.
- **`src/index.css`** — custom theme, UNLAYERED (top-level, just before
  `@layer base`): `.os-theme-app { --os-size:6px; --os-padding-perpendicular:1px;
  --os-handle-bg: color-mix(in oklch, var(--color-foreground) 22%, transparent);
  … }` plus `.os-theme-app.os-scroll-normal { --os-size:10px }`.
- **`src/pages/admin/AdminView.tsx`** — the page-level scroll uses `size="normal"`.

## The bug (evidence, from preview DevTools)
- OverlayScrollbars **initializes fine** — the scrollbar DOM exists and is
  `visibility:visible / opacity:1`.
- With our theme `os-theme-app`: the handle has **`width:0px` and
  `background: rgba(0,0,0,0)`** → invisible. The `.os-scrollbar` element DOES carry
  the `os-theme-app` class, BUT its computed `--os-size` is `"0"` and
  `--os-handle-bg` is `"none"` — i.e. **our `.os-theme-app` rule's custom
  properties are not reaching the element**.
- With the **built-in** `os-theme-dark`: handle `background: rgba(0,0,0,0.44)`,
  visible. So the library + init are correct; only our custom theme fails.
- Variable names are correct (verified against
  `node_modules/overlayscrollbars/styles/overlayscrollbars.css`: `--os-size`,
  `--os-handle-bg`, `--os-padding-*`, `--os-handle-perpendicular-size`, etc.).
- Not browser-specific (reproduced in incognito and in the preview's Chromium).

## Most likely cause
Our `.os-theme-app` rule (specificity 0,1,0) is **losing the cascade** to
OverlayScrollbars' own base CSS, which sets default `--os-*` values on
`.os-scrollbar` (also 0,1,0) — equal specificity, so **source order** decides, and
the JS-injected OS stylesheet likely lands after `index.css`. The built-in
`os-theme-dark` wins because OS authored it to. (Possibly compounded by Tailwind
v4 cascade layers around `index.css`.)

## Things to try (in order)
1. **Bump specificity** of the custom theme so it beats OS's `.os-scrollbar`
   defaults: write it as `.os-scrollbar.os-theme-app { … }` (0,2,0). Verify in
   DevTools that `--os-size` resolves to `6px` on the scrollbar element.
2. If that's not enough, ensure `overlayscrollbars.css` is imported **before**
   `index.css` so our rule wins on source order (currently imported in
   `scroll-view.tsx`).
3. Check whether Tailwind v4 is wrapping `.os-theme-app` in a cascade layer
   (inspect generated CSS); move it out / into the right layer if so.
4. Fallback that's known to work: keep OS's built-in `os-theme-dark` /
   `os-theme-light` and switch between them by app theme, overriding only
   `--os-size`/handle opacity with a higher-specificity rule.

## One-line stopgap (makes scrollbars visible immediately)
In `scroll-view.tsx`, set `theme: "os-theme-dark"` instead of `"os-theme-app"`.
Visible thumb everywhere, but a dark thumb in dark mode (not theme-aware) and
loses the custom thin sizing.

## Verify after fixing
Open admin settings (a dialog `ScrollView`, thin) and the main admin content
(`size="normal"`); both should show a slim, auto-hiding overlay thumb. DevTools:
the `.os-scrollbar`'s computed `--os-size` should be `6px` (thin) / `10px`
(normal) and `--os-handle-bg` a visible color.
