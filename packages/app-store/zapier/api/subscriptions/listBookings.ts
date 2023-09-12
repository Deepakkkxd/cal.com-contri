import type { NextApiRequest, NextApiResponse } from "next";

import findValidApiKey from "@calcom/features/ee/api-keys/lib/findValidApiKey";
import { listBookings } from "@calcom/features/webhooks/lib/scheduleTrigger";
import { defaultHandler, defaultResponder } from "@calcom/lib/server";
import isAuthorized from "@calcom/web/pages/api/oAuthAuthorization";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = req.query.apiKey as string;

  let validKey: any = null;

  if (apiKey) {
    validKey = await findValidApiKey(apiKey, "zapier");

    if (!validKey) {
      return res.status(401).json({ message: "API key not valid" });
    }
  }

  let authorizedUser: {
    id: number;
    username: string | null;
  } | null | void = null;

  if (!apiKey) {
    authorizedUser = await isAuthorized(req, res, ["READ_BOOKING"]);
  }
  if (!authorizedUser) {
    return res.status(400).json({ message: "User not found" });
  }

  const bookings = await listBookings(validKey, authorizedUser);

  if (!bookings) {
    return res.status(500).json({ message: "Unable to get bookings." });
  }
  if (bookings.length === 0) {
    const requested = validKey.teamId ? "teamId: " + validKey.teamId : "userId: " + validKey.userId;
    return res.status(404).json({
      message: `There are no bookings to retrieve, please create a booking first. Requested: \`${requested}\``,
    });
  }
  res.status(201).json(bookings);
}

export default defaultHandler({
  GET: Promise.resolve({ default: defaultResponder(handler) }),
});
