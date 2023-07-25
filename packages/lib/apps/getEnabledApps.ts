import getApps from "@calcom/app-store/utils";
import type { CredentialData } from "@calcom/app-store/utils";
import { prisma } from "@calcom/prisma";

/**
 *
 * @param credentials - Can be user or team credentials
 * @param filterOnCredentials - Only include apps where credentials are present
 * @returns A list of enabled app metadata & credentials tied to them
 */
const getEnabledApps = async (credentials: CredentialData[], filterOnCredentials?: boolean) => {
  const filterOnIds = {
    credentials: {
      some: {
        OR: [],
      },
    },
  };
  if (filterOnCredentials) {
    const userIds: number[] = [],
      teamIds: number[] = [];

    for (const credential of credentials) {
      if (credential.userId) userIds.push(credential.userId);
      if (credential.teamId) teamIds.push(credential.teamId);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (userIds.length) filterOnIds.credentials.some.OR.push({ userId: { in: userIds } });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (teamIds.length) filterOnIds.credentials.some.OR.push({ teamId: { in: teamIds } });
  }

  const enabledApps = await prisma.app.findMany({
    where: {
      OR: [
        { enabled: true, ...(filterOnIds.credentials.some.OR.length && filterOnIds) },
        // Even if filtering on credentials, everyone has Daily installed
        { slug: "daily-video", enabled: true },
      ],
    },
    select: { slug: true, enabled: true },
  });
  const apps = getApps(credentials);

  const filteredApps = enabledApps.reduce((reducedArray, app) => {
    const appMetadata = apps.find((metadata) => metadata.slug === app.slug);
    if (appMetadata) {
      reducedArray.push({ ...appMetadata, enabled: app.enabled });
    }
    return reducedArray;
  }, [] as (ReturnType<typeof getApps>[number] & { enabled: boolean })[]);

  return filteredApps;
};

export default getEnabledApps;
