import { prisma } from "@calcom/prisma";

import type { TrpcSessionUser } from "../../../trpc";

type CheckForGCalOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

export const checkForGWorkspace = async ({ ctx }: CheckForGCalOptions) => {
  const gWorkspacePresent = await prisma.credential.findFirst({
    where: {
      type: "google_workspace_directory",
      userId: ctx.user.id,
    },
  });

  return !!gWorkspacePresent;
};
