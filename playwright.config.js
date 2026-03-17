import { defineConfig } from "@playwright/test";

const PLAYWRIGHT_DEV_PORT = 4173;

export default defineConfig({
  testDir: "./tests",
  timeout: 120_000,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://127.0.0.1:${PLAYWRIGHT_DEV_PORT}`,
    viewport: { width: 2048, height: 540 },
    deviceScaleFactor: 1,
    colorScheme: "light",
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${PLAYWRIGHT_DEV_PORT} --strictPort`,
    url: `http://127.0.0.1:${PLAYWRIGHT_DEV_PORT}/tools/flowchart`,
    timeout: 120_000,
    reuseExistingServer: true,
  },
});
