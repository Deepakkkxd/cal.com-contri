import type { Session } from "next-auth";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import superjson from "superjson";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { defaultAvatarSrc } from "@calcom/lib/defaultAvatarImage";
import prisma from "@calcom/prisma";

import type { Maybe } from "@trpc/server";
import { initTRPC, TRPCError } from "@trpc/server";

import type { createContextInner } from "./createContext";

async function getUserFromSession({ session }: { session: Maybe<Session> }) {
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      bio: true,
      timeZone: true,
      weekStart: true,
      startTime: true,
      endTime: true,
      defaultScheduleId: true,
      bufferTime: true,
      theme: true,
      createdDate: true,
      hideBranding: true,
      avatar: true,
      twoFactorEnabled: true,
      disableImpersonation: true,
      identityProvider: true,
      brandColor: true,
      darkBrandColor: true,
      away: true,
      credentials: {
        select: {
          id: true,
          type: true,
          key: true,
          userId: true,
          appId: true,
          invalid: true,
        },
        orderBy: {
          id: "asc",
        },
      },
      selectedCalendars: {
        select: {
          externalId: true,
          integration: true,
        },
      },
      completedOnboarding: true,
      destinationCalendar: true,
      locale: true,
      timeFormat: true,
      trialEndsAt: true,
      metadata: true,
      role: true,
    },
  });

  // some hacks to make sure `username` and `email` are never inferred as `null`
  if (!user) {
    return null;
  }
  const { email, username } = user;
  if (!email) {
    return null;
  }
  const rawAvatar = user.avatar;
  // This helps to prevent reaching the 4MB payload limit by avoiding base64 and instead passing the avatar url
  user.avatar = rawAvatar ? `${WEBAPP_URL}/${user.username}/avatar.png` : defaultAvatarSrc({ email });

  return {
    ...user,
    rawAvatar,
    email,
    username,
  };
}

const t = initTRPC.context<typeof createContextInner>().create({
  transformer: superjson,
});

const perfMiddleware = t.middleware(async ({ path, type, next }) => {
  performance.mark("Start");
  const result = await next();
  performance.mark("End");
  performance.measure(`[${result.ok ? "OK" : "ERROR"}][$1] ${type} '${path}'`, "Start", "End");
  return result;
});

const isAuthed = t.middleware(async ({ ctx: { session, locale, ...ctx }, next }) => {
  const user = await getUserFromSession({ session });
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const i18n =
    user.locale && user.locale !== locale
      ? await serverSideTranslations(user.locale, ["common", "vital"])
      : ctx.i18n;
  return next({
    ctx: {
      i18n,
      // infers that `user` and `session` are non-nullable to downstream procedures
      session,
      user: {
        ...user,
        locale: user.locale || locale,
      },
    },
  });
});

const isAdminMiddleware = isAuthed.unstable_pipe(({ ctx, next }) => {
  if (ctx.user.role !== "ADMIN") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: { user: ctx.user },
  });
});

export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const middleware = t.middleware;
export const publicProcedure = t.procedure.use(perfMiddleware);
export const authedProcedure = t.procedure.use(perfMiddleware).use(isAuthed);

export const authedAdminProcedure = t.procedure.use(perfMiddleware).use(isAdminMiddleware);
