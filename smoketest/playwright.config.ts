import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.SMOKETEST_PORT ?? 4173);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium-live-audio",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: [
            "--use-fake-device-for-media-stream",
            "--use-fake-ui-for-media-stream",
            "--autoplay-policy=no-user-gesture-required"
          ]
        },
        permissions: ["microphone"]
      }
    }
  ],
  webServer: {
    command: "npm run serve",
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
