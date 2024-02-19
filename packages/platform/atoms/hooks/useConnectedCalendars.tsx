import { useQuery } from "@tanstack/react-query";

import type { ConnectedDestinationCalendars } from "@calcom/platform-libraries";
import type { ApiResponse } from "@calcom/platform-types";

import http from "../lib/http";

export const QUERY_KEY = "get-connected-calendars";
export const useConnectedCalendars = () => {
  const event = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => {
      return http.get<ApiResponse<ConnectedDestinationCalendars>>("/ee/calendars").then((res) => res.data);
    },
  });

  return event;
};
