import { App_RoutingForms_Form, Prisma, User, WebhookTriggerEvents } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import getWebhooks from "@calcom/features/webhooks/lib/getWebhooks";
import { sendGenericWebhookPayload } from "@calcom/features/webhooks/lib/sendPayload";
import logger from "@calcom/lib/logger";
import { RoutingFormSettings } from "@calcom/prisma/zod-utils";
import { TRPCError } from "@calcom/trpc/server";
import { authedProcedure, publicProcedure, router } from "@calcom/trpc/server/trpc";
import { Ensure } from "@calcom/types/utils";

import ResponseEmail from "./emails/templates/response-email";
import isRouter from "./isRouter";
import { jsonLogicToPrisma } from "./jsonLogicToPrisma";
import getFormsUsingTheForm from "./lib/getFormsUsingTheForm";
import { getSerializableForm } from "./lib/getSerializableForm";
import { isFormEditAllowed } from "./lib/isAllowed";
import { Response, SerializableForm } from "./types/types";
import { zodFields, zodGlobalRoute, zodRoutes } from "./zod";

async function onFormSubmission(
  form: Ensure<SerializableForm<App_RoutingForms_Form> & { user: User }, "fields">,
  response: Response
) {
  const fieldResponsesByName: Record<string, typeof response[keyof typeof response]["value"]> = {};

  for (const [fieldId, fieldResponse] of Object.entries(response)) {
    // Use the label lowercased as the key to identify a field.
    const key =
      form.fields.find((f) => f.id === fieldId)?.identifier ||
      (fieldResponse.label as keyof typeof fieldResponsesByName);
    fieldResponsesByName[key] = fieldResponse.value;
  }

  const subscriberOptions = {
    userId: form.user.id,
    // It isn't an eventType webhook
    eventTypeId: -1,
    triggerEvent: WebhookTriggerEvents.FORM_SUBMITTED,
  };

  const webhooks = await getWebhooks(subscriberOptions);
  const promises = webhooks.map((webhook) => {
    sendGenericWebhookPayload(
      webhook.secret,
      "FORM_SUBMITTED",
      new Date().toISOString(),
      webhook,
      fieldResponsesByName
    ).catch((e) => {
      console.error(`Error executing routing form webhook`, webhook, e);
    });
  });

  await Promise.all(promises);
  if (form.settings?.emailOwnerOnSubmission) {
    logger.debug(
      `Preparing to send Form Response email for Form:${form.id} to form owner: ${form.user.email}`
    );
    await sendResponseEmail(form, response, form.user.email);
  }
}

const sendResponseEmail = async (
  form: Pick<App_RoutingForms_Form, "id" | "name">,
  response: Response,
  ownerEmail: string
) => {
  try {
    const email = new ResponseEmail({ form: form, toAddresses: [ownerEmail], response: response });
    await email.sendEmail();
  } catch (e) {
    logger.error("Error sending response email", e);
  }
};

const appRoutingForms = router({
  public: router({
    response: publicProcedure
      .input(
        z.object({
          formId: z.string(),
          formFillerId: z.string(),
          response: z.record(
            z.object({
              label: z.string(),
              value: z.union([z.string(), z.array(z.string())]),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { prisma } = ctx;
        try {
          const { response, formId } = input;
          const form = await prisma.app_RoutingForms_Form.findFirst({
            where: {
              id: formId,
            },
            include: {
              user: true,
            },
          });
          if (!form) {
            throw new TRPCError({
              code: "NOT_FOUND",
            });
          }

          const serializableForm = await getSerializableForm(prisma, form);
          if (!serializableForm.fields) {
            // There is no point in submitting a form that doesn't have fields defined
            throw new TRPCError({
              code: "BAD_REQUEST",
            });
          }

          const serializableFormWithFields = {
            ...serializableForm,
            fields: serializableForm.fields,
          };

          const missingFields = serializableFormWithFields.fields
            .filter((field) => !(field.required ? response[field.id]?.value : true))
            .map((f) => f.label);

          if (missingFields.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Missing required fields ${missingFields.join(", ")}`,
            });
          }
          const invalidFields = serializableFormWithFields.fields
            .filter((field) => {
              const fieldValue = response[field.id]?.value;
              // The field isn't required at this point. Validate only if it's set
              if (!fieldValue) {
                return false;
              }
              let schema;
              if (field.type === "email") {
                schema = z.string().email();
              } else if (field.type === "phone") {
                schema = z.any();
              } else {
                schema = z.any();
              }
              return !schema.safeParse(fieldValue).success;
            })
            .map((f) => ({ label: f.label, type: f.type }));

          if (invalidFields.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Invalid fields ${invalidFields.map((f) => `${f.label}: ${f.type}`)}`,
            });
          }

          const dbFormResponse = await prisma.app_RoutingForms_FormResponse.create({
            data: input,
          });

          await onFormSubmission(serializableFormWithFields, dbFormResponse.response as Response);
          return dbFormResponse;
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2002") {
              throw new TRPCError({
                code: "CONFLICT",
              });
            }
          }
          throw e;
        }
      }),
  }),
  forms: authedProcedure.query(async ({ ctx }) => {
    const { prisma, user } = ctx;
    const forms = await prisma.app_RoutingForms_Form.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    const serializableForms = [];
    for (let i = 0; i < forms.length; i++) {
      serializableForms.push(await getSerializableForm(prisma, forms[i]));
    }
    return serializableForms;
  }),
  formQuery: authedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma, user } = ctx;
      const form = await prisma.app_RoutingForms_Form.findFirst({
        where: {
          userId: user.id,
          id: input.id,
        },
        include: {
          _count: {
            select: {
              responses: true,
            },
          },
        },
      });

      if (!form) {
        return null;
      }

      return await getSerializableForm(prisma, form);
    }),
  formMutation: authedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().nullable().optional(),
        disabled: z.boolean().optional(),
        fields: zodFields,
        routes: zodRoutes,
        addFallback: z.boolean().optional(),
        duplicateFrom: z.string().nullable().optional(),
        shouldConnect: z.boolean().optional(),
        settings: RoutingFormSettings.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user, prisma } = ctx;
      const log = logger.getChildLogger({
        prefix: ["formMutation", input.id],
      });
      const { name, id, description, settings, disabled, addFallback, duplicateFrom, shouldConnect } = input;
      if (!(await isFormEditAllowed({ userId: user.id, formId: id }))) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }
      let { routes } = input;
      let { fields } = input;

      if (duplicateFrom) {
        const sourceForm = await prisma.app_RoutingForms_Form.findFirst({
          where: {
            userId: user.id,
            id: duplicateFrom,
          },
          select: {
            id: true,
            fields: true,
            routes: true,
          },
        });
        if (!sourceForm) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Form to duplicate: ${duplicateFrom} not found`,
          });
        }
        //TODO: Instead of parsing separately, use getSerializableForm. That would automatically remove deleted fields as well.
        const fieldParsed = zodFields.safeParse(sourceForm.fields);
        const routesParsed = zodRoutes.safeParse(sourceForm.routes);
        if (!fieldParsed.success || !routesParsed.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not parse source form's fields or routes",
          });
        }

        if (shouldConnect) {
          routes = [
            // This connected route would automatically link the fields
            zodGlobalRoute.parse({
              id: sourceForm.id,
              routerType: "global",
            }),
          ];
          fields = fieldParsed.data
            // Deleted fields in the form shouldn't be added to the new form
            ?.filter((f) => !f.deleted)
            .map((f) => {
              return {
                id: f.id,
                globalRouterId: sourceForm.id,
              };
            });
        } else {
          // Duplicate just routes and fields
          // We don't want name, description and responses to be copied
          routes = routesParsed.data;
          // FIXME: Deleted fields shouldn't come in duplicate
          fields = fieldParsed.data;
        }
      }

      fields = fields || [];

      const form = await prisma.app_RoutingForms_Form.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          user: true,
          name: true,
          description: true,
          userId: true,
          disabled: true,
          createdAt: true,
          updatedAt: true,
          routes: true,
          fields: true,
          settings: true,
        },
      });

      // Add back deleted fields in the end. Fields can't be deleted, to make sure columns never decrease which hugely simplifies CSV generation
      if (form) {
        const serializedForm = await getSerializableForm(prisma, form, true);
        // Find all fields that are in DB(including deleted) but not in the mutation
        const deletedFields =
          serializedForm.fields?.filter((f) => !fields!.find((field) => field.id === f.id)) || [];

        fields = fields.concat(
          deletedFields.map((f) => {
            f.deleted = true;
            return f;
          })
        );
        const fieldsFoundForGlobalRouters = {};
        for (let i = 0; i < fields.length; i++) {
          const field = fields[i];
          if (field.globalRouterId) {
            fieldsFoundForGlobalRouters[field.globalRouterId] = true;
          }
          if (
            field.globalRouterId &&
            !serializedForm.routes?.some((route) => {
              route.id === field.globalRouterId;
            })
          ) {
            // There is a field from some global router available, make sure that the field has up-to-date info from the global router
            const globalRouterField = (
              await prisma.app_RoutingForms_Form.findFirst({
                where: {
                  id: field.globalRouterId,
                  userId: user.id,
                },
              })
            )?.fields?.find((f) => f.id === field.id);
            // Update local field(cache) with global router field on every mutation
            Object.assign(field, globalRouterField);
          }
        }

        for (let j = 0; j < routes?.length; j++) {
          const route = routes[j];
          log.silly("fieldsFoundForGlobalRouters", fieldsFoundForGlobalRouters, route);

          if (route.routerType === "global") {
            // If there are no fields for a global router, add all fields from that global router - This is the case when someone adds a global router and fields are supposed to be automatically added
            if (!fieldsFoundForGlobalRouters[route.id]) {
              log.silly("Global Route found and the fields need to be added from it", JSON.stringify(route));
              const fieldsFromGlobalRouter = (
                await prisma.app_RoutingForms_Form.findFirst({
                  where: {
                    id: route.id,
                    userId: user.id,
                  },
                })
              )?.fields.map((f) => {
                f.globalRouterId = route.id;
                return f;
              });
              fields = fields.concat(fieldsFromGlobalRouter);
            }
          }
        }
      }

      if (addFallback) {
        const uuid = uuidv4();
        routes = routes || [];
        // Add a fallback route if there is none
        if (
          !routes.find((route) => {
            if (isRouter(route)) {
              return false;
            }
            return route.isFallback;
          })
        ) {
          routes.push({
            id: uuid,
            isFallback: true,
            action: {
              type: "customPageMessage",
              value: "Thank you for your interest! We will be in touch soon.",
            },
            queryValue: { id: uuid, type: "group" },
          });
        }
      }

      log.silly("Fields to be updated", JSON.stringify(fields));

      return await prisma.app_RoutingForms_Form.upsert({
        where: {
          id: id,
        },
        create: {
          user: {
            connect: {
              id: user.id,
            },
          },
          fields: fields,
          name: name,
          description,
          // Prisma doesn't allow setting null value directly for JSON. It recommends using JsonNull for that case.
          routes: routes === null ? Prisma.JsonNull : routes,
          id: id,
        },
        update: {
          disabled: disabled,
          fields: fields,
          name: name,
          description,
          settings: settings === null ? Prisma.JsonNull : settings,
          routes: routes === null ? Prisma.JsonNull : routes,
        },
      });
    }),
  deleteForm: authedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user, prisma } = ctx;
      if (!(await isFormEditAllowed({ userId: user.id, formId: input.id }))) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      const areFormsUsingIt = (
        await getFormsUsingTheForm(prisma, {
          id: input.id,
          userId: user.id,
        })
      ).length;
      if (areFormsUsingIt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This form is being used by other forms. Please remove it's usage from there first.",
        });
      }
      return await prisma.app_RoutingForms_Form.deleteMany({
        where: {
          id: input.id,
          userId: user.id,
        },
      });
    }),

  report: authedProcedure
    .input(
      z.object({
        formId: z.string(),
        jsonLogicQuery: z.object({
          logic: z.union([z.record(z.any()), z.null()]),
        }),
        cursor: z.number().nullish(), // <-- "cursor" needs to exist when using useInfiniteQuery, but can be any type
      })
    )
    .query(async ({ ctx: { prisma }, input }) => {
      // Can be any prisma `where` clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prismaWhere: Record<string, any> = input.jsonLogicQuery
        ? jsonLogicToPrisma(input.jsonLogicQuery)
        : {};
      const skip = input.cursor ?? 0;
      const take = 50;
      logger.debug(
        `Built Prisma where ${JSON.stringify(prismaWhere)} from jsonLogicQuery ${JSON.stringify(
          input.jsonLogicQuery
        )}`
      );
      const form = await prisma.app_RoutingForms_Form.findUnique({
        where: {
          id: input.formId,
        },
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }
      // TODO: Second argument is required to return deleted operators.
      const serializedForm = await getSerializableForm(prisma, form, true);

      const rows = await prisma.app_RoutingForms_FormResponse.findMany({
        where: {
          formId: input.formId,
          ...prismaWhere,
        },
        take,
        skip,
      });
      const fields = serializedForm?.fields || [];
      const headers = fields.map((f) => f.label + (f.deleted ? "(Deleted)" : ""));
      const responses: string[][] = [];
      rows.forEach((r) => {
        const rowResponses: string[] = [];
        responses.push(rowResponses);
        fields.forEach((field) => {
          if (!r.response) {
            return;
          }
          const response = r.response as Response;
          const value = response[field.id]?.value || "";
          let stringValue = "";
          if (value instanceof Array) {
            stringValue = value.join(", ");
          } else {
            stringValue = value;
          }
          rowResponses.push(stringValue);
        });
      });
      const areThereNoResultsOrLessThanAskedFor = !rows.length || rows.length < take;
      return {
        headers,
        responses,
        nextCursor: areThereNoResultsOrLessThanAskedFor ? null : skip + rows.length,
      };
    }),
});

export default appRoutingForms;
