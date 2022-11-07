import jsforce, { TokenResponse } from "jsforce";
import type { NextApiRequest, NextApiResponse } from "next";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { getSafeRedirectUrl } from "@calcom/lib/getSafeRedirectUrl";
import prisma from "@calcom/prisma";

import { decodeOAuthState } from "../../_utils/decodeOAuthState";
import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import getInstalledAppPath from "../../_utils/getInstalledAppPath";

let consumer_key = "";
let consumer_secret = "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (code === undefined && typeof code !== "string") {
    res.status(400).json({ message: "`code` must be a string" });
    return;
  }

  if (!req.session?.user?.id) {
    return res.status(401).json({ message: "You must be logged in to do this" });
  }

  const appKeys = await getAppKeysFromSlug("salesforce");
  if (typeof appKeys.consumer_key === "string") consumer_key = appKeys.consumer_key;
  if (typeof appKeys.consumer_secret === "string") consumer_secret = appKeys.consumer_secret;
  if (!consumer_key) return res.status(400).json({ message: "Salesforce consumer key missing." });
  if (!consumer_secret) return res.status(400).json({ message: "Salesforce consumer secret missing." });

  const salesforceClient = new jsforce.Connection({
    loginUrl: process.env.SALESFORCE_LOGIN_URL || undefined,
    instanceUrl: process.env.SALESFORCE_INSTANCE_URL || undefined,
    clientId: consumer_key,
    clientSecret: consumer_secret,
    redirectUri: `${WEBAPP_URL}/api/integrations/salesforceothercalendar/callback`,
  });

  const salesforceTokenInfo = await salesforceClient.oauth2.requestToken(code as string);

  await prisma.credential.create({
    data: {
      type: "salesforce_other_calendar",
      key: salesforceTokenInfo as any,
      userId: req.session.user.id,
      appId: "salesforce",
    },
  });

  const state = decodeOAuthState(req);
  res.redirect(
    getSafeRedirectUrl(state?.returnTo) ?? getInstalledAppPath({ variant: "other", slug: "salesforce" })
  );
}
