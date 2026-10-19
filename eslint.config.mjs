import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/lib/database.types.ts",
    // Playwright isn't installed in CI; e2e has its own tsconfig.
    "e2e/**",
    "playwright.config.ts",
  ]),
]);
