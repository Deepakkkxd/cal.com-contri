import { shallow } from "zustand/shallow";

import dayjs from "@calcom/dayjs";
import { useSchedule } from "@calcom/features/schedules";
import { localStorage } from "@calcom/lib/webstorage";
import { trpc } from "@calcom/trpc/react";

import { timezoneLocalStorageKey, useTimePreferences } from "../../lib/timePreferences";
import { useBookerStore } from "../store";

/**
 * Wrapper hook around the trpc query that fetches
 * the event curently viewed in the booker. It will get
 * the current event slug and username from the booker store.
 *
 * Using this hook means you only need to use one hook, instead
 * of combining multiple conditional hooks.
 */
export const useEvent = () => {
  const [username, eventSlug] = useBookerStore((state) => [state.username, state.eventSlug], shallow);
  const isTeamEvent = useBookerStore((state) => state.isTeamEvent);
  const org = useBookerStore((state) => state.org);

  return trpc.viewer.public.event.useQuery(
    { username: username ?? "", eventSlug: eventSlug ?? "", isTeamEvent, org: org ?? null },
    { refetchOnWindowFocus: false, enabled: Boolean(username) && Boolean(eventSlug) }
  );
};

/**
 * Gets schedule for the current event and current month.
 * Gets all values right away and not the store because it increases network timing, only for the first render.
 * We can read from the store if we want to get the latest values.
 *
 * Using this hook means you only need to use one hook, instead
 * of combining multiple conditional hooks.
 *
 * The prefetchNextMonth argument can be used to prefetch two months at once,
 * useful when the user is viewing dates near the end of the month,
 * this way the multi day view will show data of both months.
 */
export const useScheduleForEvent = ({
  prefetchNextMonth,
  username,
  eventSlug,
  eventId,
  month,
  duration,
}: {
  prefetchNextMonth?: boolean;
  username?: string | null;
  eventSlug?: string | null;
  eventId?: number | null;
  month?: string | null;
  duration?: number | null;
} = {}) => {
  useTimePreferences();

  const timezone = localStorage.getItem(timezoneLocalStorageKey) || dayjs.tz.guess();
  const event = useEvent();
  const [usernameFromStore, eventSlugFromStore, monthFromStore, durationFromStore] = useBookerStore(
    (state) => [state.username, state.eventSlug, state.month, state.selectedDuration],
    shallow
  );

  return useSchedule({
    username: usernameFromStore ?? username,
    eventSlug: eventSlugFromStore ?? eventSlug,
    eventId: event.data?.id ?? eventId,
    timezone,
    prefetchNextMonth,
    month: monthFromStore ?? month,
    duration: durationFromStore ?? duration,
  });
};
