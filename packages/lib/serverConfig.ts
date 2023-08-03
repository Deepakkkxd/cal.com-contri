import type SendmailTransport from "nodemailer/lib/sendmail-transport";
import type SMTPConnection from "nodemailer/lib/smtp-connection";

import { isENVDev } from "@calcom/lib/env";

function detectTransport(): SendmailTransport.Options | SMTPConnection.Options | string {
  if (process.env.NEXT_PUBLIC_IS_E2E) {
    return "smtp://localhost:8825";
  }

  if (process.env.EMAIL_SERVER) {
    return process.env.EMAIL_SERVER;
  }

  if (process.env.EMAIL_SERVER_HOST) {
    const port = parseInt(process.env.EMAIL_SERVER_PORT || "");
    const transport = {
      host: process.env.EMAIL_SERVER_HOST,
      port,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      secure: port === 465,
      tls: {
        rejectUnauthorized: isENVDev ? false : true,
      },
    };

    return transport;
  }

  return {
    sendmail: true,
    newline: "unix",
    path: "/usr/sbin/sendmail",
  };
}

export const serverConfig = {
  transport: detectTransport(),
  from: process.env.NEXT_PUBLIC_IS_E2E ? "e2e@example.com" : process.env.EMAIL_FROM,
};
