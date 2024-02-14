import type { Availability as AvailabilityModel, Schedule as ScheduleModel } from "@prisma/client";

import dayjs from "@calcom/dayjs";
import { getWorkingHours } from "@calcom/lib/availability";
import { yyyymmdd } from "@calcom/lib/date-fns";
import type { Schedule, TimeRange } from "@calcom/types/schedule";

export type ScheduleWithAvailabilities = ScheduleModel & { availability: AvailabilityModel[] };

export type ScheduleWithAvailabilitiesForWeb = Pick<ScheduleModel, "id" | "name"> & {
  isManaged: boolean;
  workingHours: ReturnType<typeof transformWorkingHoursForClient>;
  schedule: AvailabilityModel[];
  availability: ReturnType<typeof transformAvailabilityForClient>;
  timeZone: string;
  dateOverrides: ReturnType<typeof transformDateOverridesForClient>;
  isDefault: boolean;
  isLastSchedule: boolean;
  readOnly: boolean;
};

export function transformWorkingHoursForClient(schedule: ScheduleWithAvailabilities) {
  return getWorkingHours(
    { timeZone: schedule.timeZone || undefined, utcOffset: 0 },
    schedule.availability || []
  );
}

export function transformAvailabilityForClient(schedule: ScheduleWithAvailabilities) {
  return transformScheduleToAvailabilityForClient(schedule).map((a) =>
    a.map((startAndEnd) => ({
      ...startAndEnd,
      end: new Date(startAndEnd.end.toISOString().replace("23:59:00.000Z", "23:59:59.999Z")),
    }))
  );
}

export function transformDateOverridesForClient(schedule: ScheduleWithAvailabilities, timeZone: string) {
  return schedule.availability.reduce((acc, override) => {
    // only iff future date override
    if (!override.date || dayjs.tz(override.date, timeZone).isBefore(dayjs(), "day")) {
      return acc;
    }
    const newValue = {
      start: dayjs
        .utc(override.date)
        .hour(override.startTime.getUTCHours())
        .minute(override.startTime.getUTCMinutes())
        .toDate(),
      end: dayjs
        .utc(override.date)
        .hour(override.endTime.getUTCHours())
        .minute(override.endTime.getUTCMinutes())
        .toDate(),
    };

    // Create a new date string for the current override
    // early return prevents override.date from ever being empty.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const overrideDateString = yyyymmdd(override.date!);

    // Check if there's a range with the day of the override date, to append a new range to it
    const existingDayIndex = acc.findIndex(
      (item) => yyyymmdd(dayjs(item.day)) === dayjs(override.date).format("YYYY-MM-DD")
    );

    if (existingDayIndex > -1) {
      acc[existingDayIndex].ranges.push(newValue);
      return acc;
    }

    // If the date string exists, create a new day range for the current override
    acc.push({ day: overrideDateString, ranges: [newValue] });

    return acc;
  }, [] as { day: string; ranges: TimeRange[] }[]);
}

export const transformScheduleToAvailabilityForClient = (
  schedule: Partial<ScheduleModel> & { availability: AvailabilityModel[] }
) => {
  return schedule.availability.reduce(
    (schedule: Schedule, availability) => {
      availability.days.forEach((day) => {
        schedule[day].push({
          start: new Date(
            Date.UTC(
              new Date().getUTCFullYear(),
              new Date().getUTCMonth(),
              new Date().getUTCDate(),
              availability.startTime.getUTCHours(),
              availability.startTime.getUTCMinutes()
            )
          ),
          end: new Date(
            Date.UTC(
              new Date().getUTCFullYear(),
              new Date().getUTCMonth(),
              new Date().getUTCDate(),
              availability.endTime.getUTCHours(),
              availability.endTime.getUTCMinutes()
            )
          ),
        });
      });
      return schedule;
    },
    Array.from([...Array(7)]).map(() => [])
  );
};
