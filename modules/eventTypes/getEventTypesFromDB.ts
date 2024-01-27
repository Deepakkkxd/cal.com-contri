import { LocationObject } from "@calcom/app-store/locations";
import { getBookingFieldsWithSystemFields } from "@calcom/features/bookings/lib/getBookingFields";
import { parseRecurringEvent } from "@calcom/lib";
import prisma, { userSelect } from "@calcom/prisma";
import { credentialForCalendarServiceSelect } from "@calcom/prisma/selects/credential";
import { EventTypeMetaDataSchema, customInputSchema } from "@calcom/prisma/zod-utils";

export const getEventTypesFromDB = async (eventTypeId: number) => {
  const eventType = await prisma.eventType.findUniqueOrThrow({
    where: {
      id: eventTypeId,
    },
    select: {
      id: true,
      customInputs: true,
      disableGuests: true,
      users: {
        select: {
          credentials: {
            select: credentialForCalendarServiceSelect,
          },
          ...userSelect.select,
        },
      },
      slug: true,
      team: {
        select: {
          id: true,
          name: true,
          parentId: true,
        },
      },
      bookingFields: true,
      title: true,
      length: true,
      eventName: true,
      schedulingType: true,
      description: true,
      periodType: true,
      periodStartDate: true,
      periodEndDate: true,
      periodDays: true,
      periodCountCalendarDays: true,
      lockTimeZoneToggleOnBookingPage: true,
      requiresConfirmation: true,
      requiresBookerEmailVerification: true,
      userId: true,
      price: true,
      currency: true,
      metadata: true,
      destinationCalendar: true,
      hideCalendarNotes: true,
      seatsPerTimeSlot: true,
      recurringEvent: true,
      seatsShowAttendees: true,
      seatsShowAvailabilityCount: true,
      bookingLimits: true,
      durationLimits: true,
      assignAllTeamMembers: true,
      parentId: true,
      owner: {
        select: {
          hideBranding: true,
        },
      },
      workflows: {
        include: {
          workflow: {
            include: {
              steps: true,
            },
          },
        },
      },
      locations: true,
      timeZone: true,
      schedule: {
        select: {
          availability: true,
          timeZone: true,
        },
      },
      hosts: {
        select: {
          isFixed: true,
          user: {
            select: {
              credentials: {
                select: credentialForCalendarServiceSelect,
              },
              ...userSelect.select,
              organization: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
      },
      availability: {
        select: {
          date: true,
          startTime: true,
          endTime: true,
          days: true,
        },
      },
    },
  });

  return {
    ...eventType,
    metadata: EventTypeMetaDataSchema.parse(eventType?.metadata || {}),
    recurringEvent: parseRecurringEvent(eventType?.recurringEvent),
    customInputs: customInputSchema.array().parse(eventType?.customInputs || []),
    locations: (eventType?.locations ?? []) as LocationObject[],
    bookingFields: getBookingFieldsWithSystemFields(eventType || {}),
    isDynamic: false,
  };
};