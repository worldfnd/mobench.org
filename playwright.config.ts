import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  reporter: [['list']],
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  expect: {
    timeout: 8_000,
    // Chromium text rasterization differs between macOS review captures and Linux CI.
    // Keep the budget below the size of a meaningful component or layout regression.
    toHaveScreenshot: { maxDiffPixelRatio: 0.06 },
  },
  use: {
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'bun run --cwd apps/marketing preview --host 127.0.0.1',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: 'bun run --cwd apps/docs preview --host 127.0.0.1',
      url: 'http://127.0.0.1:3001',
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
})
