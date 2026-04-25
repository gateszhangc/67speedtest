const { test, expect } = require("@playwright/test");

const MIROFISH_URL = "https://mirofish.my/";

const stubMirofishNavigation = async (context) => {
  await context.route("https://mirofish.my/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html; charset=utf-8",
      body: "<!doctype html><html><head><title>Mirofish</title></head><body>Mirofish</body></html>"
    });
  });
};

test.describe("67 Speed Test static site", () => {
  test("desktop homepage sends every button-like control to mirofish and keeps plain links internal", async ({ page }) => {
    await stubMirofishNavigation(page.context());
    await page.goto("/");

    await expect(page).toHaveTitle(/67 Speed Test/i);
    await expect(page.locator("h1")).toContainText("67 Speed Test");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /viral 20-second arm-speed challenge/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://67speedtest.lol/");
    await expect(page.locator(".brand-wordmark")).toBeVisible();
    await expect(page.getByRole("button", { name: "Expand preview" })).toBeVisible();

    await page.getByRole("link", { name: "About" }).first().click();
    await expect(page.locator("#what")).toBeInViewport();

    const imageLoadState = await page.evaluate(() =>
      Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0)
    );
    expect(imageLoadState).toBe(true);

    const faviconResponse = await page.request.get("/favicon.ico");
    expect(faviconResponse.ok()).toBe(true);

    await page.goto("/");

    await page.getByRole("link", { name: "Start 67 Speed Test" }).click();
    await expect(page).toHaveURL(MIROFISH_URL);
    await expect(page.locator("body")).toContainText("Mirofish");

    await page.goto("/");

    const redirectTargetNames = await page.locator("button, a.cta-btn, a.nav-cta").evaluateAll((targets) =>
      targets.map((target) => (target.getAttribute("aria-label") || target.textContent || "").replace(/\s+/g, " ").trim())
    );

    expect(redirectTargetNames).toHaveLength(15);

    for (const [index, targetName] of redirectTargetNames.entries()) {
      await test.step(`target ${index + 1} redirects: ${targetName}`, async () => {
        await page.goto("/");
        await page.locator("button, a.cta-btn, a.nav-cta").nth(index).evaluate((target) => {
          target.click();
        });
        await expect(page).toHaveURL(MIROFISH_URL);
        await expect(page.locator("body")).toContainText("Mirofish");
      });
    }
  });

  test("mobile layout still fits viewport and hamburger button redirects", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    await stubMirofishNavigation(context);
    const page = await context.newPage();

    await page.goto("/");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page).toHaveURL(MIROFISH_URL);
    await expect(page.locator("body")).toContainText("Mirofish");

    await context.close();
  });
});
