import { expect, test } from "@playwright/test";

test.describe("年収の壁シミュレーター", () => {
  test("calculates KPI and next wall message", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("月収（額面）").fill("120000");
    await page.getByLabel("想定継続月数").fill("12");

    await expect(page.getByText("年間見込み収入")).toBeVisible();
    await expect(page.getByText("次の壁まであと")).toBeVisible();
  });

  test("theme toggle persists via localStorage", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /ライト|ダーク/ });
    await toggle.click();
    await page.waitForTimeout(100);
    await page.reload();
    const classList = await page.evaluate(() => document.documentElement.className);
    expect(classList).toContain("theme-dark");
  });
});
