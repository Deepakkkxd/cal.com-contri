import type { NextApiRequest } from "next";

import type { UserWithCalendars } from "@calcom/lib/getConnectedDestinationCalendars";
import { getConnectedDestinationCalendars } from "@calcom/lib/getConnectedDestinationCalendars";
import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server";
import prisma from "@calcom/prisma";

import { extractUserIdsFromQuery } from "~/lib/utils/extractUserIdsFromQuery";

/**
 * @swagger
 * /connected-calendars:
 *   get:
 *     parameters:
 *       - in: query
 *         name: apiKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Your API key
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: number
 *         description: Admins can fetch connected calendars for other user e.g. &userId=1 or multiple users e.g. &userId=1&userId=2
 *     summary: Fetch connected calendars
 *     tags:
 *      - connected-calendars
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *        description: Authorization information is missing or invalid.
 *       403:
 *        description: Non admin user trying to fetch other user's connected calendars.
 */
async function getHandler(req: NextApiRequest) {
  const { userId, isAdmin } = req;

  if (!isAdmin && req.query.userId) throw new HttpError({ statusCode: 403, message: "ADMIN required" });

  const userIds = req.query.userId ? extractUserIdsFromQuery(req) : [userId];

  const usersWithCalendars = await prisma.user.findMany({
    where: { id: { in: userIds } },
    include: {
      selectedCalendars: true,
      destinationCalendar: true,
    },
  });

  return await getConnectedCalendars(usersWithCalendars);
}

async function getConnectedCalendars(users: UserWithCalendars[]) {
  const connectedDestinationCalendarsPromises = users.map((user) =>
    getConnectedDestinationCalendars(user, false, prisma).then((connectedCalendarsResult) =>
      connectedCalendarsResult.connectedCalendars.map((calendar) => ({
        userId: user.id,
        ...calendar,
      }))
    )
  );
  const connectedDestinationCalendars = await Promise.all(connectedDestinationCalendarsPromises);

  return connectedDestinationCalendars.flat();
}

export default defaultResponder(getHandler);
