import { expect, test } from "@playwright/test";

test.describe("UI snapshots", () => {
  test("home desktop layout", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveScreenshot("home-desktop.png", {
      animations: "disabled",
      fullPage: true,
      scale: "css",
      timeout: 20_000
    });
  });

  test("home mobile layout", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Mobile snapshot runs on chromium project only.");

    // Pixel project already defined in playwright.config as mobile-chrome.
    await page.goto("/");
    await expect(page).toHaveScreenshot("home-mobile.png", {
      animations: "disabled",
      fullPage: true,
      scale: "css",
      timeout: 20_000
    });
  });
});
