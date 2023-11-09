/* Schedule any workflow reminder that falls within 72 hours for email */
import type { Prisma, WorkflowReminder, WorkflowStep } from "@prisma/client";
import client from "@sendgrid/client";
import sgMail from "@sendgrid/mail";
import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";

import dayjs from "@calcom/dayjs";
import { getCalEventResponses } from "@calcom/features/bookings/lib/getCalEventResponses";
import { defaultHandler } from "@calcom/lib/server";
import { getTimeFormatStringFromUserTimeFormat } from "@calcom/lib/timeFormat";
import prisma from "@calcom/prisma";
import { WorkflowActions, WorkflowMethods, WorkflowTemplates } from "@calcom/prisma/enums";
import { bookingMetadataSchema } from "@calcom/prisma/zod-utils";

import { getiCalEventAsString } from "../lib/getiCalEventAsString";
import type { VariablesType } from "../lib/reminders/templates/customTemplate";
import customTemplate from "../lib/reminders/templates/customTemplate";
import emailReminderTemplate from "../lib/reminders/templates/emailReminderTemplate";

const sendgridAPIKey = process.env.SENDGRID_API_KEY as string;
const senderEmail = process.env.SENDGRID_EMAIL as string;

sgMail.setApiKey(sendgridAPIKey);
client.setApiKey(sendgridAPIKey);

type PartialWorkflowStep = Partial<WorkflowStep> | null;

type Booking = Prisma.BookingGetPayload<{
  include: {
    eventType: true;
    attendees: true;
    user: true;
  };
}>;

type PartialBooking = Pick<
  Booking,
  | "startTime"
  | "endTime"
  | "location"
  | "description"
  | "metadata"
  | "customInputs"
  | "responses"
  | "uid"
  | "attendees"
  | "user"
  | "eventType"
> | null;

type PartialWorkflowReminder = Pick<WorkflowReminder, "id" | "scheduledDate"> & {
  booking: PartialBooking | null;
} & { workflowStep: PartialWorkflowStep };

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = req.headers.authorization || req.query.apiKey;
  if (process.env.CRON_API_KEY !== apiKey) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_EMAIL) {
    res.status(405).json({ message: "No SendGrid API key or email" });
    return;
  }

  const sandboxMode = process.env.NEXT_PUBLIC_IS_E2E ? true : false;

  // delete batch_ids with already past scheduled date from scheduled_sends
  const pageSize = 90;
  let pageNumber = 0;

  const remindersToDelete: { referenceId: string | null }[] = [];

  while (true) {
    const newRemindersToDelete = await prisma.workflowReminder.findMany({
      where: {
        method: WorkflowMethods.EMAIL,
        cancelled: true,
        scheduledDate: {
          lte: dayjs().toISOString(),
        },
      },
      skip: pageNumber * pageSize,
      take: pageSize,
      select: {
        referenceId: true,
      },
    });

    if (newRemindersToDelete.length === 0) {
      break;
    }

    remindersToDelete.push(...newRemindersToDelete);

    pageNumber++;
  }

  const deletePromises: Promise<any>[] = [];

  for (const reminder of remindersToDelete) {
    const deletePromise = client.request({
      url: `/v3/user/scheduled_sends/${reminder.referenceId}`,
      method: "DELETE",
    });
    deletePromises.push(deletePromise);
  }

  Promise.allSettled(deletePromises).then((results) => {
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.log(`Error deleting batch id from scheduled_sends: ${result.reason}`);
      }
    });
  });

  //delete workflow reminders with past scheduled date
  await prisma.workflowReminder.deleteMany({
    where: {
      method: WorkflowMethods.EMAIL,
      scheduledDate: {
        lte: dayjs().toISOString(),
      },
    },
  });

  //cancel reminders for cancelled/rescheduled bookings that are scheduled within the next hour
  pageNumber = 0;

  const remindersToCancel: { referenceId: string | null; id: number }[] = [];

  while (true) {
    const newRemindersToCancel = await prisma.workflowReminder.findMany({
      where: {
        cancelled: true,
        scheduled: true, //if it is false then they are already cancelled
        scheduledDate: {
          lte: dayjs().add(1, "hour").toISOString(),
        },
      },
      skip: pageNumber * pageSize,
      take: pageSize,
      select: {
        referenceId: true,
        id: true,
      },
    });

    if (newRemindersToCancel.length === 0) {
      break;
    }

    remindersToCancel.push(...newRemindersToCancel);

    pageNumber++;
  }

  const cancelUpdatePromises: Promise<any>[] = [];

  for (const reminder of remindersToCancel) {
    const cancelPromise = client.request({
      url: "/v3/user/scheduled_sends",
      method: "POST",
      body: {
        batch_id: reminder.referenceId,
        status: "cancel",
      },
    });

    const updatePromise = prisma.workflowReminder.update({
      where: {
        id: reminder.id,
      },
      data: {
        scheduled: false, // to know which reminder already got cancelled (to avoid error from cancelling the same reminders again)
      },
    });

    cancelUpdatePromises.push(cancelPromise, updatePromise);
  }

  Promise.allSettled(cancelUpdatePromises).then((results) => {
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.log(`Error cancelling scheduled_sends: ${result.reason}`);
      }
    });
  });

  // schedule all unscheduled reminders within the next 72 hours
  pageNumber = 0;
  const sendEmailPromises: Promise<any>[] = [];

  const unscheduledReminders: PartialWorkflowReminder[] = [];

  while (true) {
    const newUnscheduledReminders = await prisma.workflowReminder.findMany({
      where: {
        method: WorkflowMethods.EMAIL,
        scheduled: false,
        scheduledDate: {
          lte: dayjs().add(72, "hour").toISOString(),
        },
        OR: [{ cancelled: false }, { cancelled: null }],
      },
      skip: pageNumber * pageSize,
      take: pageSize,
      select: {
        id: true,
        scheduledDate: true,
        workflowStep: {
          select: {
            action: true,
            sendTo: true,
            reminderBody: true,
            emailSubject: true,
            template: true,
            sender: true,
            includeCalendarEvent: true,
          },
        },
        booking: {
          select: {
            startTime: true,
            endTime: true,
            location: true,
            description: true,
            user: {
              select: {
                email: true,
                name: true,
                timeZone: true,
                locale: true,
                username: true,
                timeFormat: true,
                hideBranding: true,
              },
            },
            metadata: true,
            uid: true,
            customInputs: true,
            responses: true,
            attendees: true,
            eventType: {
              select: {
                bookingFields: true,
                title: true,
                slug: true,
                recurringEvent: true,
              },
            },
          },
        },
      },
    });

    if (!newUnscheduledReminders.length && pageNumber === 0) {
      res.status(200).json({ message: "No Emails to schedule" });
      return;
    }

    if (newUnscheduledReminders.length === 0) {
      break;
    }

    unscheduledReminders.push(...newUnscheduledReminders);

    pageNumber++;
  }

  for (const reminder of unscheduledReminders) {
    if (!reminder.workflowStep || !reminder.booking) {
      continue;
    }
    try {
      let sendTo;

      switch (reminder.workflowStep.action) {
        case WorkflowActions.EMAIL_HOST:
          sendTo = reminder.booking.user?.email;
          break;
        case WorkflowActions.EMAIL_ATTENDEE:
          sendTo = reminder.booking.attendees[0].email;
          break;
        case WorkflowActions.EMAIL_ADDRESS:
          sendTo = reminder.workflowStep.sendTo;
      }

      const name =
        reminder.workflowStep.action === WorkflowActions.EMAIL_ATTENDEE
          ? reminder.booking.attendees[0].name
          : reminder.booking.user?.name;

      const attendeeName =
        reminder.workflowStep.action === WorkflowActions.EMAIL_ATTENDEE
          ? reminder.booking.user?.name
          : reminder.booking.attendees[0].name;

      const timeZone =
        reminder.workflowStep.action === WorkflowActions.EMAIL_ATTENDEE
          ? reminder.booking.attendees[0].timeZone
          : reminder.booking.user?.timeZone;

      const locale =
        reminder.workflowStep.action === WorkflowActions.EMAIL_ATTENDEE ||
        reminder.workflowStep.action === WorkflowActions.SMS_ATTENDEE
          ? reminder.booking.attendees[0].locale
          : reminder.booking.user?.locale;

      let emailContent = {
        emailSubject: reminder.workflowStep.emailSubject || "",
        emailBody: `<body style="white-space: pre-wrap;">${reminder.workflowStep.reminderBody || ""}</body>`,
      };

      let emailBodyEmpty = false;

      if (reminder.workflowStep.reminderBody) {
        const { responses } = getCalEventResponses({
          bookingFields: reminder.booking.eventType?.bookingFields ?? null,
          booking: reminder.booking,
        });

        const variables: VariablesType = {
          eventName: reminder.booking.eventType?.title || "",
          organizerName: reminder.booking.user?.name || "",
          attendeeName: reminder.booking.attendees[0].name,
          attendeeEmail: reminder.booking.attendees[0].email,
          eventDate: dayjs(reminder.booking.startTime).tz(timeZone),
          eventEndTime: dayjs(reminder.booking?.endTime).tz(timeZone),
          timeZone: timeZone,
          location: reminder.booking.location || "",
          additionalNotes: reminder.booking.description,
          responses: responses,
          meetingUrl: bookingMetadataSchema.parse(reminder.booking.metadata || {})?.videoCallUrl,
          cancelLink: `/booking/${reminder.booking.uid}?cancel=true`,
          rescheduleLink: `/${reminder.booking.user?.username}/${reminder.booking.eventType?.slug}?rescheduleUid=${reminder.booking.uid}`,
        };
        const emailLocale = locale || "en";
        const emailSubject = customTemplate(
          reminder.workflowStep.emailSubject || "",
          variables,
          emailLocale,
          getTimeFormatStringFromUserTimeFormat(reminder.booking.user?.timeFormat),
          !!reminder.booking.user?.hideBranding
        ).text;
        emailContent.emailSubject = emailSubject;
        emailContent.emailBody = customTemplate(
          reminder.workflowStep.reminderBody || "",
          variables,
          emailLocale,
          getTimeFormatStringFromUserTimeFormat(reminder.booking.user?.timeFormat),
          !!reminder.booking.user?.hideBranding
        ).html;

        emailBodyEmpty =
          customTemplate(
            reminder.workflowStep.reminderBody || "",
            variables,
            emailLocale,
            getTimeFormatStringFromUserTimeFormat(reminder.booking.user?.timeFormat)
          ).text.length === 0;
      } else if (reminder.workflowStep.template === WorkflowTemplates.REMINDER) {
        emailContent = emailReminderTemplate(
          false,
          reminder.workflowStep.action,
          getTimeFormatStringFromUserTimeFormat(reminder.booking.user?.timeFormat),
          reminder.booking.startTime.toISOString() || "",
          reminder.booking.endTime.toISOString() || "",
          reminder.booking.eventType?.title || "",
          timeZone || "",
          attendeeName || "",
          name || "",
          !!reminder.booking.user?.hideBranding
        );
      }

      if (emailContent.emailSubject.length > 0 && !emailBodyEmpty && sendTo) {
        const batchIdResponse = await client.request({
          url: "/v3/mail/batch",
          method: "POST",
        });

        const batchId = batchIdResponse[1].batch_id;

        if (reminder.workflowStep.action !== WorkflowActions.EMAIL_ADDRESS) {
          sendEmailPromises.push(
            sgMail.send({
              to: sendTo,
              from: {
                email: senderEmail,
                name: reminder.workflowStep.sender || "Cal.com",
              },
              subject: emailContent.emailSubject,
              html: emailContent.emailBody,
              batchId: batchId,
              sendAt: dayjs(reminder.scheduledDate).unix(),
              replyTo: reminder.booking.user?.email || senderEmail,
              mailSettings: {
                sandboxMode: {
                  enable: sandboxMode,
                },
              },
              attachments: reminder.workflowStep.includeCalendarEvent
                ? [
                    {
                      content: Buffer.from(getiCalEventAsString(reminder.booking) || "").toString("base64"),
                      filename: "event.ics",
                      type: "text/calendar; method=REQUEST",
                      disposition: "attachment",
                      contentId: uuidv4(),
                    },
                  ]
                : undefined,
            })
          );
        }

        await prisma.workflowReminder.update({
          where: {
            id: reminder.id,
          },
          data: {
            scheduled: true,
            referenceId: batchId,
          },
        });
      }
    } catch (error) {
      console.log(`Error scheduling Email with error ${error}`);
    }
  }

  Promise.allSettled(sendEmailPromises).then((results) => {
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.log("Email sending failed", result.reason);
      }
    });
  });

  res.status(200).json({ message: "Emails scheduled" });
}

export default defaultHandler({
  POST: Promise.resolve({ default: handler }),
});
