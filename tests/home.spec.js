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
  test("desktop homepage keeps CTA links internal and sends every button to mirofish", async ({ page }) => {
    await stubMirofishNavigation(page.context());
    await page.goto("/");

    await expect(page).toHaveTitle(/67 Speed Test/i);
    await expect(page.locator("h1")).toContainText("67 Speed Test");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /viral 20-second arm-speed challenge/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://67speedtest.lol/");
    await expect(page.locator(".brand-wordmark")).toBeVisible();
    await expect(page.getByRole("button", { name: "Expand preview" })).toBeVisible();

    await page.getByRole("link", { name: "Start 67 Speed Test" }).click();
    await expect(page.locator("#game")).toBeInViewport();
    await expect(page).toHaveURL(/#game$/);

    const imageLoadState = await page.evaluate(() =>
      Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0)
    );
    expect(imageLoadState).toBe(true);

    const faviconResponse = await page.request.get("/favicon.ico");
    expect(faviconResponse.ok()).toBe(true);

    await page.goto("/");

    const buttonNames = await page.locator("button").evaluateAll((buttons) =>
      buttons.map((button) => (button.getAttribute("aria-label") || button.textContent || "").replace(/\s+/g, " ").trim())
    );

    expect(buttonNames).toHaveLength(10);

    for (const [index, buttonName] of buttonNames.entries()) {
      await test.step(`button ${index + 1} redirects: ${buttonName}`, async () => {
        await page.goto("/");
        await page.locator("button").nth(index).evaluate((button) => {
          button.click();
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
