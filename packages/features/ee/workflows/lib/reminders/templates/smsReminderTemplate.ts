import { WorkflowActions } from "@prisma/client";

import dayjs from "@calcom/dayjs";

const smsReminderTemplate = (
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
    startTime = "{EVENT_DATE_h mmA}";

    startTime = "{EVENT_TIME_MMM D h mmA}";
    attendee = action === WorkflowActions.SMS_ATTENDEE ? "{ORGANIZER}" : "{ATTENDEE}";
    name = action === WorkflowActions.SMS_ATTENDEE ? "{ATTENDEE}" : "{ORGANIZER}";
  } else {
    eventDate = dayjs(startTime).tz(timeZone).format("MMM D");
    startTime = dayjs(startTime).tz(timeZone).format("h:mmA");
  }

  const templateOne = `Hi${
    name ? ` ${name}` : ``
  }, this is a reminder that your meeting (${eventName}) with ${attendee} is on ${eventDate} at ${startTime} ${timeZone}`;

  //Twilio recomments message to be no longer than 320 characters
  if (templateOne.length <= 320) return templateOne;

  const templateTwo = `Hi, this is a reminder that your meeting with ${attendee} is on ${eventDate} at ${startTime} ${timeZone}`;

  //Twilio supports up to 1600 characters
  if (templateTwo.length <= 1600) return templateTwo;

  return null;
};

export default smsReminderTemplate;
