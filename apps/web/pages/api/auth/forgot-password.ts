import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { passwordResetRequest } from "@calcom/features/auth/lib/passwordResetRequest";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { defaultHandler } from "@calcom/lib/server";

function delay(cb: () => unknown, delay: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(cb());
    }, delay);
  });
}

async function handler(req: NextApiRequest, res: NextApiResponse)
  const email = z
    .string()
    .email()
    .transform((val) => val.toLowerCase())
    .safeParse(req.body?.email);

  if (!email.success) {
    return res.status(400).json({ message: "email is required" });
  }

  // fallback to email if ip is not present
  let ip = (req.headers["x-real-ip"] as string) ?? email.data;

  const forwardedFor = req.headers["x-forwarded-for"] as string;
  if (!ip && forwardedFor) {
    ip = forwardedFor?.split(",").at(0) ?? email.data;
  }

  // 10 requests per minute

  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: ip,
  });

  try {
    const resetLink = await passwordResetRequest(email.data);
    // By adding a random delay any attacker is unable to bruteforce existing email addresses.
    const delayInMs = Math.floor(Math.random() * 2000) + 1000;
    return await delay(() => {
      /** So we can test the password reset flow on CI */
      if (process.env.NEXT_PUBLIC_IS_E2E) {
        return res.status(201).json({
          message: t("password_reset_email_sent"),
          resetLink,
        });
      } else {
        return res.status(201).json({ message: t("password_reset_email_sent") });
      }
    }, delayInMs);
  } catch (reason) {
    console.error(reason);
    return res.status(500).json({ message: "Unable to create password reset request" });
  }
}

export default defaultHandler({
  POST: Promise.resolve({ default: handler }),
});
