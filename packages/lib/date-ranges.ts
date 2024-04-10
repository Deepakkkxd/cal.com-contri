import type { Dayjs } from "@calcom/dayjs";
import dayjs from "@calcom/dayjs";
import type { Availability } from "@calcom/prisma/client";

export type DateRange = {
  start: Dayjs;
  end: Dayjs;
};

export type DateOverride = Pick<Availability, "date" | "startTime" | "endTime">;
export type WorkingHours = Pick<Availability, "days" | "startTime" | "endTime">;

export function processWorkingHours({
  item,
  timeZone,
  dateFrom /* Date in organizer tz*/,
  dateTo /* Date in organizer tz*/,
}: {
  item: WorkingHours;
  timeZone: string;
  dateFrom: Dayjs;
  dateTo: Dayjs;
}) {
  const results = [];

  // Dayjs.startof() respects the DST changes & gives us the correct start of date, unlike Dayjs.add().
  const startOfDateFrom = dateFrom.startOf("day").tz(timeZone);
  const fromOffset = startOfDateFrom.utcOffset();

  for (let date = startOfDateFrom; date.isBefore(dateTo); date = date.add(1, "day")) {
    const offset = date.tz(timeZone).utcOffset();

    // It always has to be start of the day (midnight) even when DST changes
    // When dst changes (can happen whenever we change time like add hours/minutes), the date utcOffset doesn't updates automatically. So we need to apply the tz again.
    const dateInTz = date.add(fromOffset - offset, "minutes").tz(timeZone);
    if (!item.days.includes(dateInTz.day())) continue;

    let start = dateInTz
      .add(item.startTime.getUTCHours(), "hours")
      .add(item.startTime.getUTCMinutes(), "minutes");
    let end = dateInTz.add(item.endTime.getUTCHours(), "hours").add(item.endTime.getUTCMinutes(), "minutes");

    // If DST changes between start of day - start of availability, Add the required offset.
    // there will be 60 min offset on the day of DST change
    let offsetDiff = start.utcOffset() - start.tz(timeZone).utcOffset();
    start = start.add(offsetDiff, "minute").tz(timeZone);
    end = end.add(offsetDiff, "minute").tz(timeZone);

    // If DST changes between start of availability - end of availability, Add the required offset.
    offsetDiff = start.utcOffset() - end.utcOffset();
    end = end.add(offsetDiff, "minute").tz(timeZone);

    const startResult = dayjs.max(start, dateFrom);

    let endResult = dayjs.min(end, dateTo);
    // INFO: We only allow users to set availability up to 11:59PM which ends up not making them available
    // up to midnight.
    if (endResult.hour() === 23 && endResult.minute() === 59) {
      endResult = endResult.add(1, "minute");
    }

    // if an event ends before start, it's not a result.
    if (endResult.isBefore(startResult)) continue;

    results.push({
      start: startResult,
      end: endResult,
    });
  }
  return results;
}

export function processDateOverride({
  item,
  itemDateAsUtc,
  timeZone,
}: {
  item: DateOverride;
  itemDateAsUtc: Dayjs;
  timeZone: string;
}) {
  const itemDateStartOfDay = itemDateAsUtc.startOf("day");
  const startDate = itemDateStartOfDay
    .add(item.startTime.getUTCHours(), "hours")
    .add(item.startTime.getUTCMinutes(), "minutes")
    .second(0)
    .tz(timeZone, true);

  let endDate = itemDateStartOfDay;
  const endTimeHours = item.endTime.getUTCHours();
  const endTimeMinutes = item.endTime.getUTCMinutes();

  if (endTimeHours === 23 && endTimeMinutes === 59) {
    endDate = endDate.add(1, "day").tz(timeZone, true);
  } else {
    endDate = itemDateStartOfDay
      .add(endTimeHours, "hours")
      .add(endTimeMinutes, "minutes")
      .second(0)
      .tz(timeZone, true);
  }

  return {
    start: startDate,
    end: endDate,
  };
}

export function buildDateRanges({
  availability,
  timeZone /* Organizer timeZone */,
  dateFrom /* Attendee dateFrom */,
  dateTo /* `` dateTo */,
}: {
  timeZone: string;
  availability: (DateOverride | WorkingHours)[];
  dateFrom: Dayjs;
  dateTo: Dayjs;
}): DateRange[] {
  // Caching the dateFrom in organizer tz here becauze Dayjs.tz fn is slow.
  const dateFromOrganizerTZ = dateFrom.tz(timeZone);
  const dateToOrganizerTZ = dateTo.tz(timeZone);
  const groupedWorkingHours = groupByDate(
    availability.reduce((processed: DateRange[], item) => {
      if ("days" in item) {
        processed = processed.concat(
          processWorkingHours({ item, timeZone, dateFrom: dateFromOrganizerTZ, dateTo: dateToOrganizerTZ })
        );
      }
      return processed;
    }, [])
  );

  const groupedDateOverrides = groupByDate(
    availability.reduce((processed: DateRange[], item) => {
      if ("date" in item && !!item.date) {
        const itemDateAsUtc = dayjs.utc(item.date);
        // TODO: Remove the .subtract(1, "day") and .add(1, "day") part and
        // refactor this to actually work with correct dates.
        // As of 2024-02-20, there are mismatches between local and UTC dates for overrides
        // and the dateFrom and dateTo fields, resulting in this if not returning true, which
        // results in "no available users found" errors.
        if (
          itemDateAsUtc.isBetween(
            dateFrom.subtract(1, "day").startOf("day"),
            dateTo.add(1, "day").endOf("day"),
            null,
            "[]"
          )
        ) {
          processed.push(processDateOverride({ item, itemDateAsUtc, timeZone }));
        }
      }
      return processed;
    }, [])
  );

  const dateRanges = Object.values({
    ...groupedWorkingHours,
    ...groupedDateOverrides,
  }).map(
    // remove 0-length overrides that were kept to cancel out working dates until now.
    (ranges) => ranges.filter((range) => range.start.valueOf() !== range.end.valueOf())
  );

  return dateRanges.flat();
}

export function groupByDate(ranges: DateRange[]): { [x: string]: DateRange[] } {
  const results = ranges.reduce(
    (
      previousValue: {
        [date: string]: DateRange[];
      },
      currentValue
    ) => {
      const dateString = dayjs(currentValue.start).format("YYYY-MM-DD");

      previousValue[dateString] =
        typeof previousValue[dateString] === "undefined"
          ? [currentValue]
          : [...previousValue[dateString], currentValue];
      return previousValue;
    },
    {}
  );

  return results;
}

export function intersect(ranges: DateRange[][]): DateRange[] {
  if (!ranges.length) return [];
  // Get the ranges of the first user
  let commonAvailability = ranges[0];

  // For each of the remaining users, find the intersection of their ranges with the current common availability
  for (let i = 1; i < ranges.length; i++) {
    const userRanges = ranges[i];

    const intersectedRanges: {
      start: Dayjs;
      end: Dayjs;
    }[] = [];

    commonAvailability.forEach((commonRange) => {
      userRanges.forEach((userRange) => {
        const intersection = getIntersection(commonRange, userRange);
        if (intersection !== null) {
          // If the current common range intersects with the user range, add the intersected time range to the new array
          intersectedRanges.push(intersection);
        }
      });
    });

    commonAvailability = intersectedRanges;
  }

  // If the common availability is empty, there is no time when all users are available
  if (commonAvailability.length === 0) {
    return [];
  }

  return commonAvailability;
}

function getIntersection(range1: DateRange, range2: DateRange) {
  const start = range1.start.utc().isAfter(range2.start) ? range1.start : range2.start;
  const end = range1.end.utc().isBefore(range2.end) ? range1.end : range2.end;
  if (start.utc().isBefore(end)) {
    return { start, end };
  }
  return null;
}

export function subtract(
  sourceRanges: (DateRange & { [x: string]: unknown })[],
  excludedRanges: DateRange[]
) {
  const result: DateRange[] = [];

  for (const { start: sourceStart, end: sourceEnd, ...passThrough } of sourceRanges) {
    let currentStart = sourceStart;

    const overlappingRanges = excludedRanges.filter(
      ({ start, end }) => start.isBefore(sourceEnd) && end.isAfter(sourceStart)
    );

    overlappingRanges.sort((a, b) => (a.start.isAfter(b.start) ? 1 : -1));

    for (const { start: excludedStart, end: excludedEnd } of overlappingRanges) {
      if (excludedStart.isAfter(currentStart)) {
        result.push({ start: currentStart, end: excludedStart });
      }
      currentStart = excludedEnd.isAfter(currentStart) ? excludedEnd : currentStart;
    }

    if (sourceEnd.isAfter(currentStart)) {
      result.push({ start: currentStart, end: sourceEnd, ...passThrough });
    }
  }

  return result;
}
