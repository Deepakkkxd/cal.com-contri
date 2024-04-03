import { z } from "zod";

export const ZRoundRobinReassignInputSchema = z.object({
  teamId: z.number(),
  eventTypeId: z.number(),
  bookingId: z.number(),
});

export type TRoundRobinReassignInputSchema = z.infer<typeof ZRoundRobinReassignInputSchema>;
