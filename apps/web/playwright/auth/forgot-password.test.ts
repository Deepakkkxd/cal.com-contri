import { expect } from "@playwright/test";

import test from "../lib/fixtures";

test("Can reset forgotten password", async ({ page }) => {
  // Got to reset password flow
  await page.goto("/auth/forgot-password");

  // Fill [placeholder="john.doe@example.com"]
  await page.fill('input[name="email"]', "pro@example.com");

  // Press Enter
  await Promise.all([
    page.waitForNavigation({
      url: "/auth/forgot-password/*",
    }),
    page.press('input[type="email"]', "Enter"),
  ]);

  // Wait for page to fully load
  await page.waitForSelector("text=Reset Password");
  // Fill input[name="password"]
  await page.fill('input[name="password"]', "pro");

  // Click text=Submit
  await page.click('button[type="submit"]');

  await page.waitForSelector("text=Success", {
    timeout: 3000,
  });

  await expect(page.locator(`text=Success`)).toBeVisible();

  // Click button:has-text("Login")
  await Promise.all([page.waitForNavigation({ url: "/auth/login" }), page.click('button:has-text("Login")')]);

  // Fill input[name="email"]
  await page.fill('input[name="email"]', "pro@example.com");
  await page.fill('input[name="password"]', "pro");
  await page.press('input[name="password"]', "Enter");
  await page.waitForSelector("[data-testid=dashboard-shell]");

  await expect(page.locator("[data-testid=dashboard-shell]")).toBeVisible();
});
