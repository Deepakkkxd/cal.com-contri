import { TRPCError } from "@calcom/trpc/server";

import type { RateLimitHelper } from "./rateLimit";
import { rateLimiter } from "./rateLimit";

export async function checkRateLimitAndThrowError({
  rateLimitingType = "core",
  identifier,
  onRateLimiterResponse,
  opts,
}: RateLimitHelper) {
  const response = await rateLimiter()({ rateLimitingType, identifier, opts });
  const { remaining, reset } = response;

  if (onRateLimiterResponse) onRateLimiterResponse(response);

  if (remaining < 1) {
    if (rateLimitingType === "sms") {
      // block sms feature for user
    } else if (rateLimitingType === "smsMonth") {
      // mark user as reviewNeeded
    } else {
      const convertToSeconds = (ms: number) => Math.floor(ms / 1000);
      const secondsToWait = convertToSeconds(reset - Date.now());
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. Try again in ${secondsToWait} seconds.`,
      });
    }
  }
}
