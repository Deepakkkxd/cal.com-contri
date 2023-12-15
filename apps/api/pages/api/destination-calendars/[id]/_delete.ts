import type { NextApiRequest } from "next";

import { defaultResponder } from "@calcom/lib/server";

import { schemaQueryIdParseInt } from "~/lib/validations/shared/queryIdTransformParseInt";

/**
 * @swagger
 * /destination-calendars/{id}:
 *   delete:
 *     summary: Remove an existing destination calendar
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        example: 601
 *        required: true
 *        description: ID of the destination calendar to delete
 *      - in: query
 *        name: apiKey
 *        required: true
 *        schema:
 *          type: string
 *        example: 1234abcd5678efgh
 *        description: Your API key
 *     tags:
 *      - destination-calendars
 *     responses:
 *       200:
 *         description: OK, destinationCalendar removed successfully
 *       401:
 *        description: Authorization information is missing or invalid.
 *        $ref: "#/components/responses/ErrorUnauthorized"
 *       404:
 *        description: Destination calendar not found
 */
export async function deleteHandler(req: NextApiRequest) {
  const { prisma, query } = req;
  const { id } = schemaQueryIdParseInt.parse(query);
  await prisma.destinationCalendar.delete({ where: { id } });
  return { message: `OK, Destination Calendar removed successfully` };
}

export default defaultResponder(deleteHandler);
