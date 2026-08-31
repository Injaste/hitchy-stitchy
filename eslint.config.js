import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// Flat config for ESLint 10. `npm run lint` had no config file at all, so
// nothing in the repo was being linted — this restores it.
export default tseslint.config(
  { ignores: ["dist", "dev-dist", "node_modules", "supabase"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // React Compiler readiness rules, new in eslint-plugin-react-hooks v7.
      // They flag patterns that behave correctly today but would have to change
      // to adopt the compiler — 108 hits here, which would drown the real
      // findings. Off until the compiler is actually on the roadmap; turn them
      // back on one at a time when it is.
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/static-components": "off",
      "react-hooks/incompatible-library": "off",

      // Real signal, but too many pre-existing hits to gate on today.
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  // The service worker runs in a worker scope, not the browser one.
  {
    files: ["src/sw.ts"],
    languageOptions: { globals: globals.serviceworker },
  },
  // Config files run in Node.
  {
    files: ["*.config.{js,ts}", "vite.config.ts", "pwa-assets.config.ts"],
    languageOptions: { globals: globals.node },
  },
);
