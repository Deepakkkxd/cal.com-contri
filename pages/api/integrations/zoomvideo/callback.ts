/* eslint-disable no-async-promise-executor */
import { parseTokenPayload } from "@lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import prisma from "../../../../lib/prisma";

// const client_id = process.env.ZOOM_CLIENT_ID;
// const client_secret = process.env.ZOOM_CLIENT_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  // Check that user is authenticated
  const session = await getSession({ req: req });

  if (!session) {
    res.status(401).json({ message: "You must be logged in to do this" });
    return;
  }

  const redirectUri = encodeURI(process.env.BASE_URL + "/api/integrations/zoomvideo/callback");
  // const authHeader = "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64");
  const authHeader = `Bearer ${process.env.ZOOM_JWT_TOKEN}`;

  return new Promise(async (resolve, reject) => {
    try {
      const result = await fetch(
        "https://zoom.us/oauth/token?grant_type=authorization_code&code=" +
          code +
          "&redirect_uri=" +
          redirectUri,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "User-Agent": "Zoom-Jwt-Request",
            "content-type": "application/json",
          },
        }
      ).then((res) => res.json());

      const { exp } = parseTokenPayload(result?.access_token);
      const credentialIntegrated = await prisma.credential.create({
        data: {
          type: "zoom_video",
          key: { ...result, expires_in: exp },
          userId: session.user.id,
        },
      });

      res.redirect("/integrations");
      resolve(credentialIntegrated);
    } catch (e) {
      reject(e);
    }
  });
}
