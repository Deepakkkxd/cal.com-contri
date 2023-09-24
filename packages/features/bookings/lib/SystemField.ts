import { z } from "zod";

export const SystemField = z.enum([
  "name",
  "email",
  "location",
  "title",
  "notes",
  "guests",
  "rescheduleReason",
  "smsReminderNumber",
  "PaypalId",
  "baddress",
  "iban",
  "bcode",
  "bname",
  "payment",
  "address",
  "PhoneNumber",
]);

export const SMS_REMINDER_NUMBER_FIELD = "smsReminderNumber";
