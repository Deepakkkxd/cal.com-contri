import { WorkflowActions } from "@prisma/client";
import dayjs from "@calcom/dayjs";

export const whatsappEventRescheduledTemplate = (
  isEditingMode: boolean,
  action?: WorkflowActions,
  startTime?: string,
  eventName?: string,
  timeZone?: string,
  attendee?: string,
  name?: string
) => {
  let eventDate;
  if (isEditingMode) {
    eventName = "{EVENT_NAME}";
    timeZone = "{TIMEZONE}";
    startTime = "{START_TIME_h:mmA}";

    eventDate = "{EVENT_DATE_YYYY MMM D}";
    attendee = action === WorkflowActions.WHATSAPP_ATTENDEE ? "{ORGANIZER}" : "{ATTENDEE}";
    name = action === WorkflowActions.WHATSAPP_ATTENDEE ? "{ATTENDEE}" : "{ORGANIZER}";
  } else {
    eventDate = dayjs(startTime).tz(timeZone).format("YYYY MMM D");
    startTime = dayjs(startTime).tz(timeZone).format("h:mmA");
  }

  const templateOne = `Hi${
    name ? ` ${name}` : ``
  }, your meeting (${eventName}) with ${attendee} on ${eventDate} at ${startTime} ${timeZone} has been rescheduled.`;
  
  
  //Twilio supports up to 1600 characters
  if (templateOne.length <= 1600) return templateOne;

  return null;
};
