import type { NextApiRequest } from "next";

import { IS_TEAM_BILLING_ENABLED } from "@calcom/lib/constants";
import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server";
import { MembershipRole } from "@calcom/prisma/enums";

import { schemaMembershipPublic } from "~/lib/validations/membership";
import { schemaTeamCreateBodyParams, schemaTeamReadPublic } from "~/lib/validations/team";

/**
 * @swagger
 * /teams:
 *   post:
 *     operationId: addTeam
 *     summary: Creates a new team
 *     parameters:
 *        - in: query
 *          name: apiKey
 *          required: true
 *          schema:
 *            type: string
 *          description: Your API key
 *     requestBody:
 *        description: Create a new custom input for an event type
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - name
 *                - slug
 *                - hideBookATeamMember
 *                - brandColor
 *                - darkBrandColor
 *                - timeZone
 *                - weekStart
 *                - isPrivate
 *              properties:
 *                name:
 *                  type: string
 *                  description: Name of the team
 *                slug:
 *                  type: string
 *                  description: A unique slug that works as path for the team public page
 *                hideBookATeamMember:
 *                  type: boolean
 *                  description: Flag to hide or show the book a team member option
 *                brandColor:
 *                  type: string
 *                  description: Primary brand color for the team
 *                darkBrandColor:
 *                  type: string
 *                  description: Dark variant of the primary brand color for the team
 *                timeZone:
 *                  type: string
 *                  description: Time zone of the team
 *                weekStart:
 *                  type: string
 *                  description: Starting day of the week for the team
 *                isPrivate:
 *                  type: boolean
 *                  description: Flag indicating if the team is private
 *                ownerId:
 *                  type: number
 *                  description: ID of the team owner - only admins can set this and it is a required field for admins.
 *     tags:
 *     - teams
 *     responses:
 *       201:
 *         description: OK, team created
 *       400:
 *        description: Bad request. Team body is invalid.
 *       401:
 *        description: Authorization information is missing or invalid.
 */
async function postHandler(req: NextApiRequest) {
  const { prisma, body, userId, isAdmin } = req;
  const { ownerId, ...data } = schemaTeamCreateBodyParams.parse(body);

  await checkPermissions(req);

  const effectiveUserId = isAdmin && ownerId ? ownerId : userId;

  if (data.slug) {
    const alreadyExist = await prisma.team.findFirst({
      where: {
        slug: data.slug,
      },
    });
    if (alreadyExist) throw new HttpError({ statusCode: 409, message: "Team slug already exists" });
    if (IS_TEAM_BILLING_ENABLED) {
      // Setting slug in metadata, so it can be published later
      data.metadata = {
        requestedSlug: data.slug,
      };
      delete data.slug;
    }
  }

  // Check if parentId is related to this user
  if (data.parentId) {
    const parentTeam = await prisma.team.findFirst({
      where: { id: data.parentId, members: { some: { userId, role: { in: ["OWNER", "ADMIN"] } } } },
    });
    if (!parentTeam)
      throw new HttpError({
        statusCode: 401,
        message: "Unauthorized: Invalid parent id. You can only use parent id of your own teams.",
      });
  }

  // TODO: Perhaps there is a better fix for this?
  const cloneData: typeof data & {
    metadata: NonNullable<typeof data.metadata> | undefined;
  } = {
    ...data,
    metadata: data.metadata === null ? {} : data.metadata || undefined,
  };
  const team = await prisma.team.create({
    data: {
      ...cloneData,
      createdAt: new Date(),
      members: {
        // We're also creating the relation membership of team ownership in this call.
        create: { userId: effectiveUserId, role: MembershipRole.OWNER, accepted: true },
      },
    },
    include: { members: true },
  });
  req.statusCode = 201;
  // We are also returning the new ownership relation as owner besides team.
  return {
    team: schemaTeamReadPublic.parse(team),
    owner: schemaMembershipPublic.parse(team.members[0]),
    message: isAdmin
      ? "Team created successfully, we also made user with submitted userId the owner of this team"
      : "Team created successfully, we also made you the owner of this team",
  };
}

async function checkPermissions(req: NextApiRequest) {
  const { isAdmin } = req;
  const body = schemaTeamCreateBodyParams.parse(req.body);

  /* Non-admin users can only create teams for themselves */
  if (!isAdmin && body.ownerId)
    throw new HttpError({
      statusCode: 401,
      message: "ADMIN required for `ownerId`",
    });

  /* Admin users are required to pass in a userId */
  if (isAdmin && !body.ownerId)
    throw new HttpError({ statusCode: 400, message: "`ownerId` required for ADMIN" });
}

export default defaultResponder(postHandler);
