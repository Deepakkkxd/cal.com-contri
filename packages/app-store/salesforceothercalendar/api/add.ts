import jsforce from "jsforce";
import type { NextApiRequest, NextApiResponse } from "next";

import { WEBAPP_URL } from "@calcom/lib/constants";

import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";

let consumer_key = "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const appKeys = await getAppKeysFromSlug("salesforce");
  if (typeof appKeys.consumer_key === "string") consumer_key = appKeys.consumer_key;
  if (!consumer_key) return res.status(400).json({ message: "Salesforce client id missing." });

  const salesforceClient = new jsforce.Connection({
    loginUrl: process.env.SALESFORCE_LOGIN_URL || undefined,
    instanceUrl: process.env.SALESFORCE_INSTANCE_URL || undefined,
    clientId: consumer_key,
    redirectUri: `${WEBAPP_URL}/api/integrations/salesforceothercalendar/callback`,
  });

  const url = salesforceClient.oauth2.getAuthorizationUrl({});
  res.status(200).json({ url });
}
