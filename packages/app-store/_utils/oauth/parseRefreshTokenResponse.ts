import { z } from "zod";

import { APP_CREDENTIAL_SHARING_ENABLED } from "@calcom/lib/constants";

const minimumTokenReponseSchema = z.object({
  access_token: z.string(),
  //   Assume that any property with a number is the expiry
  [z.string().toString()]: z.number(),
  //   Allow other properties in the token response
  [z.string().optional().toString()]: z.unknown().optional(),
});

const parseRefreshTokenResponse = (response: any, schema: z.ZodTypeAny) => {
  let refreshTokenResponse;
  if (APP_CREDENTIAL_SHARING_ENABLED && process.env.CALCOM_CREDENTIAL_SYNC_ENDPOINT) {
    refreshTokenResponse = minimumTokenReponseSchema.safeParse(response);
  } else {
    refreshTokenResponse = schema.parse(response);
  }

  if (!refreshTokenResponse.success) {
    throw new Error("Invalid refreshed tokens were returned");
  }

  if (!refreshTokenResponse.data.refresh_token) {
    refreshTokenResponse.data.refresh_token = "refresh_token";
  }

  return refreshTokenResponse;
};

export default parseRefreshTokenResponse;
