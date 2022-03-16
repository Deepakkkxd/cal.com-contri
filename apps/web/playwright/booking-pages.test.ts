import { expect, test } from "@playwright/test";

import prisma from "@lib/prisma";

import {
  selectFirstAvailableTimeSlotNextMonth,
  selectSecondAvailableTimeSlotNextMonth,
  todo,
} from "./lib/testUtils";

const deleteBookingsByEmail = async (email: string) =>
  prisma.booking.deleteMany({
    where: {
      user: {
        email,
      },
    },
  });

async function bookFirstEvent(page) {
  // Click first event type
  await page.click('[data-testid="event-type-link"]');
  await selectFirstAvailableTimeSlotNextMonth(page);
  // --- fill form
  await page.fill('[name="name"]', "Test Testson");
  await page.fill('[name="email"]', "test@example.com");
  await page.press('[name="email"]', "Enter");

  // Make sure we're navigated to the success page
  await page.waitForNavigation({
    url(url) {
      return url.pathname.endsWith("/success");
    },
  });
}

test.describe("free user", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/free");
  });

  test.afterEach(async () => {
    // delete test bookings
    await deleteBookingsByEmail("free@example.com");
  });

  test("only one visible event", async ({ page }) => {
    await expect(page.locator(`[href="/free/30min"]`)).toBeVisible();
    await expect(page.locator(`[href="/free/60min"]`)).not.toBeVisible();
  });

  test("cannot book same slot multiple times", async ({ page }) => {
    // Click first event type
    await page.click('[data-testid="event-type-link"]');

    await selectFirstAvailableTimeSlotNextMonth(page);

    // Navigate to book page
    await page.waitForNavigation({
      url(url) {
        return url.pathname.endsWith("/book");
      },
    });

    // save booking url
    const bookingUrl: string = page.url();

    const bookTimeSlot = async () => {
      // --- fill form
      await page.fill('[name="name"]', "Test Testson");
      await page.fill('[name="email"]', "test@example.com");
      await page.press('[name="email"]', "Enter");
    };

    // book same time spot twice
    await bookTimeSlot();

    // Make sure we're navigated to the success page
    await page.waitForNavigation({
      url(url) {
        return url.pathname.endsWith("/success");
      },
    });

    // return to same time spot booking page
    await page.goto(bookingUrl);

    // book same time spot again
    await bookTimeSlot();

    // check for error message
    await expect(page.locator("[data-testid=booking-fail]")).toBeVisible();
  });

  // Why do we need this test. The previous test is testing /30min booking only ?
  todo("`/free/30min` is bookable");

  test("`/free/60min` is not bookable", async ({ page }) => {
    // Not available in listing
    await expect(page.locator('[href="/free/60min"]')).toHaveCount(0);

    await page.goto("/free/60min");
    // Not available on a direct visit to event type page
    await expect(page.locator('[data-testid="404-page"]')).toBeVisible();
  });
});

test.describe("pro user", () => {
  test.use({ storageState: "playwright/artifacts/proStorageState.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/pro");
  });

  test.afterEach(async () => {
    // delete test bookings
    await deleteBookingsByEmail("pro@example.com");
  });

  test("pro user's page has at least 2 visible events", async ({ page }) => {
    const $eventTypes = await page.$$("[data-testid=event-types] > *");
    expect($eventTypes.length).toBeGreaterThanOrEqual(2);
  });

  test("book an event first day in next month", async ({ page }) => {
    // Click first event type
    await page.click('[data-testid="event-type-link"]');
    await selectFirstAvailableTimeSlotNextMonth(page);
    // --- fill form
    await page.fill('[name="name"]', "Test Testson");
    await page.fill('[name="email"]', "test@example.com");
    await page.press('[name="email"]', "Enter");

    // Make sure we're navigated to the success page
    await page.waitForNavigation({
      url(url) {
        return url.pathname.endsWith("/success");
      },
    });
  });
  test("can reschedule a booking", async ({ page }) => {
    await bookFirstEvent(page);

    await page.goto("/bookings/upcoming");
    await page.locator('[data-testid="reschedule"]').click();
    await page.waitForNavigation({
      url: (url) => {
        const bookingId = url.searchParams.get("rescheduleUid");
        return !!bookingId;
      },
    });
    await selectSecondAvailableTimeSlotNextMonth(page);
    // --- fill form
    await page.locator('[data-testid="confirm-reschedule-button"]').click();
    await page.waitForNavigation({
      url(url) {
        return url.pathname === "/success" && url.searchParams.get("reschedule") === "true";
      },
    });
  });

  test("Can cancel the recently created booking", async ({ page }) => {
    await bookFirstEvent(page);

    await page.goto("/bookings/upcoming");
    await page.locator('[data-testid="cancel"]').click();
    await page.waitForNavigation({
      url: (url) => {
        return url.pathname.startsWith("/cancel");
      },
    });
    // --- fill form
    await page.locator('[data-testid="cancel"]').click();
    await page.waitForNavigation({
      url(url) {
        return url.pathname === "/cancel/success";
      },
    });
  });
});
