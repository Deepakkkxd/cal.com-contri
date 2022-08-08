import { Credential } from "@prisma/client";

import CloseCom from "@calcom/lib/CloseCom";
import { symmetricDecrypt } from "@calcom/lib/crypto";
import logger from "@calcom/lib/logger";
import type {
  Calendar,
  CalendarEvent,
  EventBusyDate,
  IntegrationCalendar,
  NewCalendarEventType,
} from "@calcom/types/Calendar";

const CALENDSO_ENCRYPTION_KEY = process.env.CALENDSO_ENCRYPTION_KEY || "";

// Cal.com Custom Activity Fields
const calComCustomActivityFields: [string, string, boolean, boolean][] = [
  ["Attendees", "contact", true, true],
  ["Date & Time", "datetime", true, false],
  ["Duration", "text", true, false],
  ["Organizer", "contact", true, false],
  ["Additional notes", "text", false, false],
];

/**
 * Authentication
 * Close.com requires Basic Auth for any request to their APIs, which is far from
 * ideal considering that such a strategy requires generating an API Key by the
 * user and input it in our system. A Setup page was created when trying to install
 * Close.com App in order to instruct how to create such resource and to obtain it.
 *
 * Meeting creation
 * Close.com does not expose a "Meeting" API, it may be available in the future.
 *
 * Per Close.com documentation (https://developer.close.com/resources/custom-activities):
 * "To work with Custom Activities, you will need to create a Custom Activity Type and
 * likely add one or more Activity Custom Fields to that type. Once the Custom Activity
 * Type is defined, you can create Custom Activity instances of that type as you would
 * any other activity."
 *
 * Contact creation
 * Every contact in Close.com need to belong to a Lead. When creating a contact in
 * Close.com as part of this integration, a new generic Lead will be created in order
 * to assign every contact created by this process, and it is named "From Cal.com"
 */
export default class CloseComCalendarService implements Calendar {
  private integrationName = "";
  private closeCom: CloseCom;
  private log: typeof logger;

  constructor(credential: Credential) {
    this.integrationName = "closecom_other_calendar";

    const descrypted = symmetricDecrypt(
      (credential.key as { encrypted: string }).encrypted,
      CALENDSO_ENCRYPTION_KEY
    ); // TODO: Zod-ify

    const { userApiKey } = JSON.parse(descrypted);

    this.closeCom = new CloseCom(userApiKey);

    this.log = logger.getChildLogger({ prefix: [`[[lib] ${this.integrationName}`] });
  }

  private async closeComContactSearch(event: CalendarEvent) {}

  private getMeetingBody(event: CalendarEvent): string {
    return `<b>${event.organizer.language.translate("invitee_timezone")}:</b> ${
      event.attendees[0].timeZone
    }<br><br><b>${event.organizer.language.translate("share_additional_notes")}</b><br>${
      event.additionalNotes || "-"
    }`;
  }

  private async closeComCreateCustomActivity(event: CalendarEvent) {}

  private async closeComUpdateCustomActivity(uid: string, event: CalendarEvent) {}

  private async closeComDeleteCustomActivity(uid: string) {}

  private async getCloseComContactIds(event: CalendarEvent) {
    // Get Cal.com generic Lead
    const leadFromCalComId = await this.getCloseComGenericLeadId();
    // Check if attendees exist or to see if any should be created
    const closeComContacts = await this.closeCom.contact.search({
      emails: event.attendees.map((att) => att.email),
    });
    // NOTE: If contact is duplicated in Close.com we will get more results
    //       messing around with the expected number of contacts retrieved
    if (closeComContacts.data.length < event.attendees.length) {
      // Create missing contacts
      const attendeesEmails = event.attendees.map((att) => att.email);
      // Existing contacts based on attendees emails: contacts may have more
      // than one email, we just need the one used by the event.
      const existingContactsEmails = closeComContacts.data.flatMap((cont) =>
        cont.emails.filter((em) => attendeesEmails.includes(em.email)).map((ems) => ems.email)
      );
      const nonExistingContacts = event.attendees.filter(
        (attendee) => !existingContactsEmails.includes(attendee.email)
      );
      const createdContacts = await Promise.all(
        nonExistingContacts.map(
          async (att) =>
            await this.closeCom.contact.create({
              attendee: att,
              leadId: leadFromCalComId,
            })
        )
      );
      if (createdContacts.length === nonExistingContacts.length) {
        // All non existent contacts where created
        return closeComContacts.data.map((cont) => cont.id).concat(createdContacts.map((cont) => cont.id));
      } else {
        return Promise.reject("Some contacts were not possible to create in Close.com");
      }
    } else {
      return closeComContacts.data.map((cont) => cont.id);
    }
  }

  /**
   * Check if generic "From Cal.com" Lead exists, create it if not
   */
  getCloseComGenericLeadId = async (): Promise<string> => {
    const closeComLeadNames = await this.closeCom.lead.list({ query: { _fields: ["name", "id"] } });
    const searchLeadFromCalCom = closeComLeadNames.data.filter((lead) => lead.name === "From Cal.com");
    if (searchLeadFromCalCom.length === 0) {
      // No Lead exists, create it
      const createdLeadFromCalCom = await this.closeCom.lead.create({
        companyName: "From Cal.com",
        description: "Generic Lead for Contacts created by Cal.com",
      });
      return createdLeadFromCalCom.id;
    } else {
      return searchLeadFromCalCom[0].id;
    }
  };

  private async getCloseComCustomActivityTypeFieldsIds() {
    // Check if Custom Activity Type exists
    const customActivities = await this.closeCom.customActivity.type.get();
    const calComCustomActivity = customActivities.data.filter((act) => act.name === "Cal.com Activity");
    if (calComCustomActivity.length > 0) {
      // Cal.com Custom Activity type exist
      // Get Custom Activity Fields
      const currentActivityFields = await this.closeCom.customField.activity.get({
        query: { _fields: ["name"] },
      });
      const currentActivityFieldsNames = currentActivityFields.data.map((fie) => fie.name);
      const customActivityFieldsExist = calComCustomActivityFields.map((cusFie) =>
        currentActivityFieldsNames.includes(cusFie[0])
      );
      const [attendeeId, dateTimeId, organizerId, additionalNotesId] = await Promise.all(
        customActivityFieldsExist.map(async (exist, idx) => {
          if (!exist) {
            const [name, type, required, multiple] = calComCustomActivityFields[idx];
            const created = await this.closeCom.customField.activity.create({
              custom_activity_type_id: calComCustomActivity[0].id,
              name,
              type,
              required,
              accepts_multiple_values: multiple,
              editable_with_roles: [],
            });
            return created.id;
          } else {
            const index = currentActivityFieldsNames.findIndex(
              (val) => val === calComCustomActivityFields[idx][0]
            );
            if (index >= 0) {
              return currentActivityFields.data[index].id;
            } else {
              throw Error("Couldn't find the field index");
            }
          }
        })
      );
      return {
        activityTypeId: calComCustomActivity[0].id,
        fields: {
          attendeeId,
          dateTimeId,
          organizerId,
          additionalNotesId,
        },
      };
    } else {
      // Cal.com Custom Activity type doesn't exist
      // Create Custom Activity Type
      const { id: activityTypeId } = await this.closeCom.customActivity.type.create({
        name: "Cal.com Activity",
        description: "Bookings in your Cal.com account",
      });
      // Create Custom Activity Fields
      const [attendeeId, dateTimeId, organizerId, additionalNotesId] = await Promise.all(
        calComCustomActivityFields.map(async ([name, type, required, multiple]) => {
          const creation = await this.closeCom.customField.activity.create({
            custom_activity_type_id: activityTypeId,
            name,
            type,
            required,
            accepts_multiple_values: multiple,
            editable_with_roles: [],
          });
          return creation.id;
        })
      );
      return {
        activityTypeId,
        fields: {
          attendeeId,
          dateTimeId,
          organizerId,
          additionalNotesId,
        },
      };
    }
  }

  async createEvent(event: CalendarEvent): Promise<NewCalendarEventType> {
    // Get Contacts ids
    // Get Custom Activity Type id
    // Create Custom Activity type instance
    /**
     * await this.closeCom.activity.custom.create({
     *   "custom.ID_ORGANIZER": "ID_CONTACT",
     *   "custom.ID_ATTENDEES": ["ID_CONTACT", "ID_CONTACT"]
     * });
     */
    return Promise.resolve({
      uid: "",
      id: "",
      type: "",
      password: "",
      url: "",
      additionalInfo: {},
    });
  }

  async updateEvent(uid: string, event: CalendarEvent): Promise<any> {
    return await this.closeComUpdateCustomActivity(uid, event);
  }

  async deleteEvent(uid: string): Promise<void> {
    return await this.closeComDeleteCustomActivity(uid);
  }

  async getAvailability(
    dateFrom: string,
    dateTo: string,
    selectedCalendars: IntegrationCalendar[]
  ): Promise<EventBusyDate[]> {
    return Promise.resolve([]);
  }

  async listCalendars(event?: CalendarEvent): Promise<IntegrationCalendar[]> {
    return Promise.resolve([]);
  }
}
