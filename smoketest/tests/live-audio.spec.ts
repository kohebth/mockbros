import { expect, test } from "@playwright/test";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3000";

test("records fake microphone audio and receives a live transcript", async ({ page }) => {
  await page.goto(`/?backendUrl=${encodeURIComponent(backendUrl)}&recordMs=350`);

  await page.getByTestId("start-session").click();
  await page.waitForFunction(() => {
    const connection = document.querySelector("[data-testid='connection-status']")?.textContent ?? "";
    const result = document.querySelector("[data-testid='result-status']")?.textContent ?? "";
    return connection.includes("Connected") || result.includes("Error:");
  });
  const resultStatus = await page.getByTestId("result-status").textContent();
  expect(resultStatus, `Backend setup failed: ${resultStatus}`).not.toContain("Error:");
  await expect(page.getByTestId("connection-status")).toContainText("Connected", { timeout: 10_000 });
  await expect(page.getByTestId("question-text")).not.toContainText("Start a session", { timeout: 10_000 });

  await page.getByTestId("record-answer").click();

  await expect(page.getByTestId("audio-status")).toContainText(/Transcript:/, { timeout: 20_000 });
  await expect(page.getByTestId("result-status")).toContainText(/Transcript received|Interview completed/, {
    timeout: 20_000
  });
  await expect(page.getByTestId("event-log")).toContainText("audio_final");
  await expect(page.getByTestId("event-log")).toContainText("transcript_final");
});
