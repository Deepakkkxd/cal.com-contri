import logger from "@calcom/lib/logger";
import { safeStringify } from "@calcom/lib/safeStringify";
import type { RedirectType } from "@calcom/prisma/client";

const log = logger.getChildLogger({ prefix: ["lib", "getTemporaryOrgRedirect"] });
export const getTemporaryOrgRedirect = async ({
  slug,
  redirectType,
  eventTypeSlug,
}: {
  slug: string;
  redirectType: RedirectType;
  eventTypeSlug: string | null;
}) => {
  const prisma = (await import("@calcom/prisma")).default;
  log.debug(
    `Looking for redirect for`,
    safeStringify({
      slug,
      redirectType,
      eventTypeSlug,
    })
  );
  // Not supporting dynamic group for now
  const redirect = await prisma.tempOrgRedirect.findFirst({
    where: {
      type: redirectType,
      from: slug,
      fromOrgId: 0,
    },
  });

  if (redirect) {
    log.debug(`Redirecting ${slug} to ${redirect.toUrl}`);
    return {
      redirect: {
        permanent: false,
        destination: eventTypeSlug ? `${redirect.toUrl}/${eventTypeSlug}` : redirect.toUrl,
      },
    } as const;
  }
  return null;
};
