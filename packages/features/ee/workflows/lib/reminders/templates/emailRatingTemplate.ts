import dayjs from "@calcom/dayjs";
import { APP_NAME } from "@calcom/lib/constants";
import { TimeFormat } from "@calcom/lib/timeFormat";
import { WorkflowActions } from "@calcom/prisma/enums";

const emailRatingTemplate = (
  isEditingMode: boolean,
  action?: WorkflowActions,
  timeFormat?: TimeFormat,
  startTime?: string,
  endTime?: string,
  eventName?: string,
  timeZone?: string,
  otherPerson?: string,
  name?: string,
  isBrandingDisabled?: boolean
) => {
  const currentTimeFormat = timeFormat || TimeFormat.TWELVE_HOUR;
  const dateTimeFormat = `ddd, MMM D, YYYY ${currentTimeFormat}`;

  let eventDate = "";

  if (isEditingMode) {
    endTime = "{EVENT_END_TIME}";
    eventName = "{EVENT_NAME}";
    timeZone = "{TIMEZONE}";
    otherPerson = action === WorkflowActions.EMAIL_ATTENDEE ? "{ORGANIZER}" : "{ATTENDEE}";
    name = action === WorkflowActions.EMAIL_ATTENDEE ? "{ATTENDEE}" : "{ORGANIZER}";
    eventDate = `{EVENT_DATE_${dateTimeFormat}}`;
  } else {
    eventDate = dayjs(startTime).tz(timeZone).format(dateTimeFormat);

    endTime = dayjs(endTime).tz(timeZone).format(currentTimeFormat);
  }

  const emailSubject = `How was your recent experience?: ${eventName}`;

  const introHtml = `<body>Hi${
    name ? ` ${name}` : ""
  },<br><br>We're always looking to improve our customer's experience. How satisfied were you with your recent meeting?<br><br>`;

  // todo: add rating link 1-5: https://app.cal.com/booking/qsiaNB3vppjxRkWgYUjB?rating=1
  const ratingHtml = `<div><a href="">😠</a><a href="">🙁</a><a href="">😐</a><a href="">😄</a><a href="">😍</a></div>${eventName}<br><br>`;

  const eventHtml = `<div><strong class="editor-text-bold">Event: </strong></div>${eventName}<br><br>`;

  const dateTimeHtml = `<div><strong class="editor-text-bold">Date & Time: </strong></div>${eventDate} - ${endTime} (${timeZone})<br><br>`;

  const attendeeHtml = `<div><strong class="editor-text-bold">Attendees: </strong></div>You & ${otherPerson}<br><br>`;

  const branding = !isBrandingDisabled && !isEditingMode ? `<br><br>_<br><br>Scheduling by ${APP_NAME}` : "";

  const endingHtml = `This survey was triggered by a Workflow in Cal.${branding}</body>`;

  const emailBody = introHtml + ratingHtml + eventHtml + dateTimeHtml + attendeeHtml + endingHtml;

  return { emailSubject, emailBody };
};

export default emailRatingTemplate;
