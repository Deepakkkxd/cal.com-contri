import { getDefaultEvent } from "@calcom/lib/defaultEvents";
import prisma from "@calcom/prisma";
import { getEventTypesFromDB } from "../eventTypes/getEventTypesFromDB";
import { BookingStatus } from ".prisma/client";

export type NewBookingEventType =
    | Awaited<ReturnType<typeof getDefaultEvent>>
    | Awaited<ReturnType<typeof getEventTypesFromDB>>;

export async function getOriginalRescheduledBooking(uid: string, seatsEventType?: boolean) {
    return prisma.booking.findFirst({
        where: {
            uid: uid,
            status: {
                in: [BookingStatus.ACCEPTED, BookingStatus.CANCELLED, BookingStatus.PENDING],
            },
        },
        include: {
            attendees: {
                select: {
                    name: true,
                    email: true,
                    locale: true,
                    timeZone: true,
                    ...(seatsEventType && { bookingSeat: true, id: true }),
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    locale: true,
                    timeZone: true,
                    destinationCalendar: true,
                    credentials: {
                        select: {
                            id: true,
                            userId: true,
                            key: true,
                            type: true,
                            teamId: true,
                            appId: true,
                            invalid: true,
                            user: {
                                select: {
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
            destinationCalendar: true,
            payment: true,
            references: true,
            workflowReminders: true,
        },
    });
}