import type { Page } from "@playwright/test";
import type { createUsersFixture } from "playwright/fixtures/users";

export const inviteUserToOrganization = async ({
  page,
  organizationId,
  email,
  usersFixture,
}: {
  page: Page;
  organizationId: number;
  email: string;
  usersFixture: ReturnType<typeof createUsersFixture>;
}) => {
  await page.goto("/settings/organizations/members");
  await page.waitForLoadState("networkidle");
  const invitedUserEmail = usersFixture.trackEmail({
    username: email.split("@")[0],
    domain: email.split("@")[1],
  });
  await inviteAnEmail(page, invitedUserEmail);
  return { invitedUserEmail };
};

async function inviteAnEmail(page: Page, invitedUserEmail: string) {
  await page.locator('button:text("Add")').click();
  await page.locator('input[name="inviteUser"]').fill(invitedUserEmail);
  await page.locator('button:text("Send invite")').click();
  await page.waitForLoadState("networkidle");
}
