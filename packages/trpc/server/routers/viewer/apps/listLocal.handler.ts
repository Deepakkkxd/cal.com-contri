import { AppCategories } from "@prisma/client";

import { appKeysSchemas } from "@calcom/app-store/apps.keys-schemas.generated";
import { getLocalAppMetadata } from "@calcom/app-store/utils";
import prisma from "@calcom/prisma";

import type { TrpcSessionUser } from "../../../trpc";
import type { TListLocalInputSchema } from "./listLocal.schema";
import type { FilteredApp } from "./types";

type ListLocalOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TListLocalInputSchema;
};

export const listLocalHandler = async ({ ctx, input }: ListLocalOptions) => {
  const category = input.category === "conferencing" ? "video" : input.category;
  const localApps = getLocalAppMetadata().filter(
    (app) => app.categories?.some((appCategory) => appCategory === category) || app.category === category
  );

  const dbApps = await prisma.app.findMany({
    where: {
      categories: {
        has: AppCategories[category as keyof typeof AppCategories],
      },
    },
    select: {
      slug: true,
      keys: true,
      enabled: true,
      dirName: true,
    },
  });

  const filteredApps: FilteredApp[] = [];

  for (const app of localApps) {
    // Find app metadata
    const dbData = dbApps.find((dbApp) => dbApp.slug === app.slug);

    // If the app already contains keys then return
    if (dbData?.keys) {
      filteredApps.push({
        name: app.name,
        slug: app.slug,
        logo: app.logo,
        title: app.title,
        type: app.type,
        description: app.description,
        // We know that keys are going to be an object or null. Prisma can not type check against JSON fields
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        keys: dbData.keys,
        dirName: app.dirName || app.slug,
        enabled: dbData?.enabled || false,
        isTemplate: app.isTemplate,
      });
    } else {
      const keysSchema = appKeysSchemas[app.dirName as keyof typeof appKeysSchemas];

      const keys: Record<string, string> = {};

      if (typeof keysSchema !== "undefined") {
        Object.values(keysSchema.keyof()._def.values).reduce((keysObject, key) => {
          keys[key as string] = "";
          return keysObject;
        }, {} as Record<string, string>);
      }

      filteredApps.push({
        name: app.name,
        slug: app.slug,
        logo: app.logo,
        type: app.type,
        title: app.title,
        description: app.description,
        enabled: dbData?.enabled || false,
        dirName: app.dirName || app.slug,
        keys: Object.keys(keys).length === 0 ? null : keys,
      });
    }
  }

  return filteredApps;
};
