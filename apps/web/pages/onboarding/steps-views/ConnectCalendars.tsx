import { ArrowRightIcon } from "@heroicons/react/solid";

import classNames from "@calcom/lib/classNames";

import { trpc } from "@lib/trpc";

import { List } from "@components/List";

import { CalendarItem } from "../components/CalendarItem";
import { ConnectedCalendarItem } from "../components/ConnectedCalendarItem";
import { CreateEventsOnCalendarSelect } from "../components/CreateEventsOnCalendarSelect";

interface IConnectCalendarsProps {
  nextStep: () => void;
}

const ConnectedCalendars = (props: IConnectCalendarsProps) => {
  const { nextStep } = props;
  const queryConnectedCalendars = trpc.useQuery(["viewer.connectedCalendars"], { suspense: true });
  const queryIntegrations = trpc.useQuery([
    "viewer.integrations",
    { variant: "calendar", onlyInstalled: false },
  ]);
  const firstCalendar = queryConnectedCalendars.data?.connectedCalendars.find(
    (item) => item.calendars && item.calendars?.length > 0
  );
  const disabledNextButton = firstCalendar === undefined;
  const destinationCalendar = queryConnectedCalendars.data?.destinationCalendar;
  return (
    <>
      {/* Already connected calendars  */}
      {firstCalendar && (
        <>
          <List className="rounded-md border border-gray-200 bg-white p-0 dark:bg-black">
            <ConnectedCalendarItem
              key={firstCalendar.integration.title}
              name={firstCalendar.integration.title}
              logo={firstCalendar.integration.imageSrc}
              externalId={
                firstCalendar && firstCalendar.calendars && firstCalendar.calendars.length > 0
                  ? firstCalendar.calendars[0].externalId
                  : ""
              }
              calendars={firstCalendar.calendars}
              integrationType={firstCalendar.integration.type}
            />
          </List>
          {/* Create event on selected calendar */}
          <CreateEventsOnCalendarSelect calendar={destinationCalendar} />
          <p className="mt-7 text-sm text-gray-500">You can add more calendars from the app store</p>
        </>
      )}

      {/* Connect calendars list */}
      {firstCalendar === undefined && queryIntegrations.data && queryIntegrations.data.items.length > 0 && (
        <List className="rounded-md border border-gray-200 bg-white p-0 dark:bg-black">
          {queryIntegrations.data &&
            queryIntegrations.data.items.map((item, index) => (
              <>
                <CalendarItem
                  type={item.type}
                  key={item.title}
                  title={item.title}
                  description={item.description}
                  imageSrc={item.imageSrc}
                />
                {index < queryIntegrations.data.items.length - 1 && (
                  <div className="h-[1px] w-full border-b border-gray-200" />
                )}
              </>
            ))}
        </List>
      )}
      <button
        type="button"
        className={classNames(
          "mt-8 flex w-full flex-row justify-center rounded-md border border-black bg-black p-2 text-center text-white",
          disabledNextButton ? "cursor-not-allowed opacity-20" : ""
        )}
        onClick={() => nextStep()}
        disabled={disabledNextButton}>
        {firstCalendar ? "Continue" : "Next Step"}
        <ArrowRightIcon className="ml-2 h-5 w-5 self-center" aria-hidden="true" />
      </button>
    </>
  );
};

export { ConnectedCalendars };
