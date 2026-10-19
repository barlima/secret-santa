import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against a deployed URL (see e2e/draw.spec.ts).
// Preview deployments behind Vercel Authentication need a protection bypass
// secret: Vercel → Project → Settings → Deployment Protection.
const bypass = process.env.E2E_VERCEL_BYPASS;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL,
    trace: "retain-on-failure",
    extraHTTPHeaders: bypass
      ? { "x-vercel-protection-bypass": bypass, "x-vercel-set-bypass-cookie": "true" }
      : undefined,
  },
  projects: [{ name: "mobile", use: { ...devices["iPhone 14"], browserName: "chromium" } }],
});
