import { z } from "zod";

import { eventTypeAppCardZod } from "../eventTypeAppCardZod";

export const appDataSchema = eventTypeAppCardZod.merge(
  z.object({
    thankYouPage: z.string().optional(),
  })
);

export const appKeysSchema = z.object({});
