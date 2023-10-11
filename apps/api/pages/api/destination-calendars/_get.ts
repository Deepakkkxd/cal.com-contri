import type { NextApiRequest } from "next";

import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server";

import { schemaDestinationCalendarReadPublic } from "~/lib/validations/destination-calendar";

/**
 * @swagger
 * /destination-calendars:
 *   get:
 *     parameters:
 *       - in: query
 *         name: apiKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Your API key
 *     summary: Find all destination calendars
 *     tags:
 *      - destination-calendars
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *        description: Authorization information is missing or invalid.
 *       404:
 *         description: No destination calendars were found
 */
async function getHandler(req: NextApiRequest) {
  const { userId, prisma } = req;

  const userEventTypes = await prisma.eventType.findMany({
    where: { userId },
    select: { id: true },
  });

  // Extract the IDs of the user's event types
  const userEventTypeIds = userEventTypes.map((eventType) => eventType.id);

  const allDestinationCalendars = await prisma.destinationCalendar.findMany({
    where: {
      OR: [{ userId }, { eventTypeId: { in: userEventTypeIds } }],
    },
  });

  if (allDestinationCalendars.length === 0)
    new HttpError({ statusCode: 404, message: "No destination calendars were found" });

  return {
    destinationCalendars: allDestinationCalendars.map((destinationCalendar) =>
      schemaDestinationCalendarReadPublic.parse(destinationCalendar)
    ),
  };
}

export default defaultResponder(getHandler);
