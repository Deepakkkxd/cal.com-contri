import type { Prisma } from "@prisma/client";

import type { getEventTypesFromDB } from "@calcom/features/bookings/lib/handleNewBooking";
import { UserRepository } from "@calcom/lib/server/repository/user";
import type { userSelect } from "@calcom/prisma";
import prisma from "@calcom/prisma";
import { credentialForCalendarServiceSelect } from "@calcom/prisma/selects/credential";
import type { CredentialPayload } from "@calcom/types/Credential";

type User = Prisma.UserGetPayload<typeof userSelect>;

/**
 * Gets credentials from the user, team, and org if applicable
 *
 */
export const getAllCredentials = async (
  user: User & { credentials: CredentialPayload[] },
  eventType: Awaited<ReturnType<typeof getEventTypesFromDB>>
) => {
  let allCredentials = user.credentials;

  // If it's a team event type query for team credentials
  if (eventType.team?.id) {
    const teamCredentialsQuery = await prisma.credential.findMany({
      where: {
        teamId: eventType.team.id,
      },
      select: credentialForCalendarServiceSelect,
    });
    allCredentials.push(...teamCredentialsQuery);
  }

  // If it's a managed event type, query for the parent team's credentials
  if (eventType.parentId) {
    const teamCredentialsQuery = await prisma.team.findFirst({
      where: {
        eventTypes: {
          some: {
            id: eventType.parentId,
          },
        },
      },
      select: {
        credentials: {
          select: credentialForCalendarServiceSelect,
        },
      },
    });
    if (teamCredentialsQuery?.credentials) {
      allCredentials.push(...teamCredentialsQuery?.credentials);
    }
  }

  const { profile } = await UserRepository.enrichUserWithItsProfile({
    user: user,
  });

  // If the user is a part of an organization, query for the organization's credentials
  if (profile?.organizationId) {
    const org = await prisma.team.findUnique({
      where: {
        id: profile.organizationId,
      },
      select: {
        credentials: {
          select: credentialForCalendarServiceSelect,
        },
      },
    });

    if (org?.credentials) {
      allCredentials.push(...org.credentials);
    }
  }

  // Only return CRM credentials that are enabled on the event type
  const eventTypeAppMetadata = eventType?.metadata?.apps;

  const crmCredentialIds = [];

  for (const appKey in eventTypeAppMetadata) {
    const app = eventTypeAppMetadata[appKey];
    if (app.enabled && app.appCategories && app.appCategories.some((category) => category === "crm")) {
      crmCredentialIds.push(app.credentialId);
    }
  }

  allCredentials = allCredentials.filter((credential) => {
    if (!credential.type.includes("_crm") && !credential.type.includes("_other_calendar")) {
      return credential;
    }

    if (crmCredentialIds.some((id) => id === credential.id)) {
      return credential;
    }
  });

  return allCredentials;
};
