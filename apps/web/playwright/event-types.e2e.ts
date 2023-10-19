import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { randomString } from "@calcom/lib/random";

import { test } from "./lib/fixtures";
import { bookTimeSlot, createNewEventType, selectFirstAvailableTimeSlotNextMonth } from "./lib/testUtils";

test.describe.configure({ mode: "parallel" });

test.describe("Event Types tests", () => {
  test.describe("user", () => {
    test.beforeEach(async ({ page, users }) => {
      const user = await users.create();
      await user.apiLogin();
      await page.goto("/event-types");
      // We wait until loading is finished
      await page.waitForSelector('[data-testid="event-types"]');
    });

    test.afterEach(async ({ users }) => {
      await users.deleteAll();
    });

    test("has at least 2 events", async ({ page }) => {
      const $eventTypes = page.locator("[data-testid=event-types] > li a");
      const count = await $eventTypes.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test("can add new event type", async ({ page }) => {
      const nonce = randomString(3);
      const eventTitle = `hello ${nonce}`;
      await createNewEventType(page, { eventTitle });
      await page.goto("/event-types");
      await expect(page.locator(`text='${eventTitle}'`)).toBeVisible();
    });

    test("enabling recurring event comes with default options", async ({ page }) => {
      const nonce = randomString(3);
      const eventTitle = `my recurring event ${nonce}`;
      await createNewEventType(page, { eventTitle });

      await page.click("[data-testid=vertical-tab-recurring]");
      await expect(page.locator("[data-testid=recurring-event-collapsible]")).toBeHidden();
      await page.click("[data-testid=recurring-event-check]");
      await expect(page.locator("[data-testid=recurring-event-collapsible]")).toBeVisible();

      expect(
        await page
          .locator("[data-testid=recurring-event-collapsible] input[type=number]")
          .nth(0)
          .getAttribute("value")
      ).toBe("1");
      expect(
        await page.locator("[data-testid=recurring-event-collapsible] div[class$=singleValue]").textContent()
      ).toBe("week");
      expect(
        await page
          .locator("[data-testid=recurring-event-collapsible] input[type=number]")
          .nth(1)
          .getAttribute("value")
      ).toBe("12");
    });

    test("can duplicate an existing event type", async ({ page }) => {
      const firstElement = await page.waitForSelector(
        '[data-testid="event-types"] a[href^="/event-types/"] >> nth=0'
      );
      const href = await firstElement.getAttribute("href");
      expect(href).toBeTruthy();
      const [eventTypeId] = new URL(WEBAPP_URL + href).pathname.split("/").reverse();
      const firstTitle = await page.locator(`[data-testid=event-type-title-${eventTypeId}]`).innerText();
      const firstFullSlug = await page.locator(`[data-testid=event-type-slug-${eventTypeId}]`).innerText();
      const firstSlug = firstFullSlug.split("/")[2];

      await page.click(`[data-testid=event-type-options-${eventTypeId}]`);
      await page.click(`[data-testid=event-type-duplicate-${eventTypeId}]`);
      // Wait for the dialog to appear so we can get the URL
      await page.waitForSelector('[data-testid="dialog-title"]');

      const url = page.url();
      const params = new URLSearchParams(url);

      expect(params.get("title")).toBe(firstTitle);
      expect(params.get("slug")).toContain(firstSlug);

      const formTitle = await page.inputValue("[name=title]");
      const formSlug = await page.inputValue("[name=slug]");

      expect(formTitle).toBe(firstTitle);
      expect(formSlug).toContain(firstSlug);
    });

    test("edit first event", async ({ page }) => {
      const $eventTypes = page.locator("[data-testid=event-types] > li a");
      const firstEventTypeElement = $eventTypes.first();
      await firstEventTypeElement.click();
      await page.waitForURL((url) => {
        return !!url.pathname.match(/\/event-types\/.+/);
      });
      await page.locator("[data-testid=update-eventtype]").click();
      const toast = await page.waitForSelector('[data-testid="toast-success"]');
      expect(toast).toBeTruthy();
    });

    test("can add multiple organizer address", async ({ page }) => {
      const $eventTypes = page.locator("[data-testid=event-types] > li a");
      const firstEventTypeElement = $eventTypes.first();
      await firstEventTypeElement.click();
      await page.waitForURL((url) => {
        return !!url.pathname.match(/\/event-types\/.+/);
      });

      const locationData = ["location 1", "location 2", "location 3"];

      const fillLocation = async (inputText: string, index: number) => {
        await page.locator("#location-select").last().click();
        await page.locator("text=In Person (Organizer Address)").last().click();

        const locationInputName = `locations[${index}].address`;
        await page.locator(`input[name="${locationInputName}"]`).waitFor();
        await page.locator(`input[name="locations[${index}].address"]`).fill(inputText);
        await page.locator("[data-testid=display-location]").last().check();
        await page.locator("[data-testid=update-eventtype]").click();
        await page.waitForLoadState("networkidle");
      };

      await fillLocation(locationData[0], 0);

      await page.locator("[data-testid=add-location]").click();
      await fillLocation(locationData[1], 1);

      await page.locator("[data-testid=add-location]").click();
      await fillLocation(locationData[2], 2);

      await page.locator("[data-testid=update-eventtype]").click();

      await page.goto("/event-types");

      const previewLink = await page
        .locator("[data-testid=preview-link-button]")
        .first()
        .getAttribute("href");

      /**
       * Verify first organizer address
       */
      await page.goto(previewLink ?? "");
      await selectFirstAvailableTimeSlotNextMonth(page);
      await page.locator(`span:has-text("${locationData[0]}")`).click();
      await bookTimeSlot(page);
      await expect(page.locator("[data-testid=success-page]")).toBeVisible();
      await expect(page.locator(`[data-testid="where"]`)).toHaveText(locationData[0]);

      /**
       * Verify second organizer address
       */
      await page.goto(previewLink ?? "");
      await selectFirstAvailableTimeSlotNextMonth(page);
      await page.locator(`span:has-text("${locationData[1]}")`).click();
      await bookTimeSlot(page);
      await expect(page.locator("[data-testid=success-page]")).toBeVisible();
      await expect(page.locator(`[data-testid="where"]`)).toHaveText(locationData[1]);
    });

    test.describe("Different Locations Tests", () => {
      test("can add Attendee Phone Number location and book with it", async ({ page }) => {
        await gotoFirstEventType(page);
        await selectAttendeePhoneNumber(page);
        await saveEventType(page);
        await gotoBookingPage(page);
        await selectFirstAvailableTimeSlotNextMonth(page);

        await page.locator(`[data-fob-field-name="location"] input`).fill("9199999999");
        await bookTimeSlot(page);

        await expect(page.locator("[data-testid=success-page]")).toBeVisible();
        await expect(page.locator("text=+19199999999")).toBeVisible();
      });

      test("Can add Organzer Phone Number location and book with it", async ({ page }) => {
        await gotoFirstEventType(page);

        await page.locator("#location-select").click();
        await page.locator(`text="Organizer Phone Number"`).click();
        const locationInoputName = "locations[0].hostPhoneNumber";

        await page.locator(`input[name=${locationInoputName}]`).waitFor();
        await page.locator(`input[name=${locationInoputName}]`).fill("9199999999");

        await saveEventType(page);
        await gotoBookingPage(page);
        await selectFirstAvailableTimeSlotNextMonth(page);

        await bookTimeSlot(page);

        await expect(page.locator("[data-testid=success-page]")).toBeVisible();
        await expect(page.locator("text=+19199999999")).toBeVisible();
      });

      test("Can add Cal video location and book with it", async ({ page }) => {
        await gotoFirstEventType(page);

        await page.locator("#location-select").click();
        await page.locator(`text="Cal Video (Global)"`).click();

        await saveEventType(page);
        await page.getByTestId("toast-success").waitFor();
        await gotoBookingPage(page);
        await selectFirstAvailableTimeSlotNextMonth(page);

        await bookTimeSlot(page);

        await expect(page.locator("[data-testid=success-page]")).toBeVisible();
        await expect(page.locator("[data-testid=where] ")).toHaveText("Cal Video");
      });

      test("Can add Link Meeting as location and book with it", async ({ page }) => {
        await gotoFirstEventType(page);

        await page.locator("#location-select").click();
        await page.locator(`text="Link meeting"`).click();

        const locationInputName = `locations[0].link`;

        const testUrl = "https://cal.ai/";
        await page.locator(`input[name="${locationInputName}"]`).fill(testUrl);

        await saveEventType(page);
        await page.getByTestId("toast-success").waitFor();
        await gotoBookingPage(page);
        await selectFirstAvailableTimeSlotNextMonth(page);

        await bookTimeSlot(page);

        await expect(page.locator("[data-testid=success-page]")).toBeVisible();
        const linkElement = await page.locator("[data-testid=where] > a");
        expect(await linkElement.getAttribute("href")).toBe(testUrl);
      });

      test("Can remove location from multiple locations that are saved", async ({ page }) => {
        await gotoFirstEventType(page);

        // Add Attendee Phone Number location
        await selectAttendeePhoneNumber(page);

        // Add Cal Video location
        await page.locator("[data-testid=add-location]").click();
        await page.locator("#location-select").last().click();
        await page.locator(`text="Cal Video (Global)"`).click();

        await saveEventType(page);
        await page.waitForLoadState("networkidle");

        // Remove Attendee Phone Number Location
        const removeButtomId = "delete-locations.0.type";
        await page.getByTestId(removeButtomId).click();

        await saveEventType(page);
        await page.waitForLoadState("networkidle");

        await gotoBookingPage(page);
        await selectFirstAvailableTimeSlotNextMonth(page);

        await bookTimeSlot(page);

        await expect(page.locator("[data-testid=success-page]")).toBeVisible();
        await expect(page.locator("[data-testid=where]")).toHaveText("Cal Video");
      });
    });
  });
});

const selectAttendeePhoneNumber = async (page: Page) => {
  const locationOptionText = "Attendee Phone Number";
  await page.locator("#location-select").click();
  await page.locator(`text=${locationOptionText}`).click();
};

async function gotoFirstEventType(page: Page) {
  const $eventTypes = page.locator("[data-testid=event-types] > li a");
  const firstEventTypeElement = $eventTypes.first();
  await firstEventTypeElement.click();
  await page.waitForURL((url) => {
    return !!url.pathname.match(/\/event-types\/.+/);
  });
}

async function saveEventType(page: Page) {
  await page.locator("[data-testid=update-eventtype]").click();
}

async function gotoBookingPage(page: Page) {
  const previewLink = await page.locator("[data-testid=preview-button]").getAttribute("href");

  await page.goto(previewLink ?? "");
}
