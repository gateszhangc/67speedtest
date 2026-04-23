const { test, expect } = require("@playwright/test");

test.describe("67 Speed Test static site", () => {
  test("desktop homepage renders key content and interactions", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/67 Speed Test/i);
    await expect(page.locator("h1")).toContainText("67 Speed Test");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /viral 20-second arm-speed challenge/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://67speedtest.lol/");
    await expect(page.locator(".brand-wordmark")).toBeVisible();
    await expect(page.getByRole("button", { name: "Expand preview" })).toBeVisible();

    await page.getByRole("link", { name: "Start 67 Speed Test" }).click();
    await expect(page.locator("#game")).toBeInViewport();

    await page.getByRole("button", { name: /What is the 67 speed test/i }).click();
    await expect(page.getByText(/camera-based arm-speed challenge/i)).toBeVisible();

    const imageLoadState = await page.evaluate(() =>
      Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0)
    );
    expect(imageLoadState).toBe(true);
  });

  test("mobile layout keeps navigation and faq usable without overflow", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const page = await context.newPage();

    await page.goto("/");

    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page.locator("#navLinks").getByRole("link", { name: "Modes" })).toBeVisible();
    await page.locator("#navLinks").getByRole("link", { name: "FAQ" }).click();
    await expect(page.locator("#faq")).toBeInViewport();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await page.getByRole("button", { name: /How do I improve my 67 speed test score fast/i }).click();
    await expect(page.getByText(/brighter light, fixed camera/i)).toBeVisible();

    await context.close();
  });
});
