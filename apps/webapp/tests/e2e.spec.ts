import { expect, test } from "@playwright/test";

const formatJPY = (value: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 }).format(
    value
  );

test.describe("年収の壁シミュレーター", () => {
  test("landing hero and teaser slider are visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "年収の“壁”を、やさしく見通すダッシュボード", exact: true })
    ).toBeVisible();
    const monthlyInput = page.getByLabel("月収（額面）");
    await expect(monthlyInput).toBeVisible();
    await expect(page.getByRole("button", { name: /詳細設定を開く|詳細設定を閉じる/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "開始する" })).toBeVisible();
  });

  test("teaser adjustment carries state to /app", async ({ page }) => {
    await page.goto("/");
    const monthlyInput = page.getByLabel("月収（額面）");
    await monthlyInput.fill("");
    await monthlyInput.type("180000");
    await page.getByRole("button", { name: "開始する" }).click();
    await page.waitForURL("**/app?**");
    await expect(page).toHaveURL(/income=180000/);
    await expect(page.getByRole("heading", { name: "今年の見通しと次の壁" })).toBeVisible();
    await expect(page.getByText(formatJPY(2_160_000))).toBeVisible();
  });

  test("editing via sheet updates KPI after保存", async ({ page }) => {
    await page.goto("/app?income=180000&months=12&weekly=%3E%3D20&firm=%3C%3D50&dep=none&mode=individual");
    const editButton = page.getByRole("button", { name: "入力を編集" });
    await editButton.click();
    const monthlyInput = page.getByLabel("月収（額面）");
    await monthlyInput.press("Control+a");
    await monthlyInput.type("200000");
    await page.getByRole("button", { name: "保存" }).click();
    await expect(page.getByText(formatJPY(2_400_000))).toBeVisible();
  });

  test("state persists after reload", async ({ page }) => {
    await page.goto("/app?income=200000&months=12&weekly=%3E%3D20&firm=%3C%3D50&dep=none&mode=individual");
    await page.reload();
    await expect(page.getByText(formatJPY(2_400_000))).toBeVisible();
  });
});
