import { Trans } from "next-i18next";
import Head from "next/head";
import React, { Fragment } from "react";

import { QueryCell } from "@lib/QueryCell";
import { useLocale } from "@lib/hooks/useLocale";
import { inferQueryOutput, trpc } from "@lib/trpc";

import Shell from "@components/Shell";
import CreateEventTypeButton from "@components/eventtype/CreateEventType";
import EventTypeList from "@components/eventtype/EventTypeList";
import EventTypeListHeading from "@components/eventtype/EventTypeListHeading";
import { Alert } from "@components/ui/Alert";
import UserCalendarIllustration from "@components/ui/svg/UserCalendarIllustration";

type Profiles = inferQueryOutput<"viewer.eventTypes">["profiles"];

interface CreateEventTypeProps {
  canAddEvents: boolean;
  profiles: Profiles;
}

const CreateFirstEventTypeView = ({ canAddEvents, profiles }: CreateEventTypeProps) => {
  const { t } = useLocale();

  return (
    <div className="md:py-20">
      <UserCalendarIllustration />
      <div className="mx-auto block text-center md:max-w-screen-sm">
        <h3 className="mt-2 text-xl font-bold text-neutral-900">{t("new_event_type_heading")}</h3>
        <p className="text-md mt-1 mb-2 text-neutral-600">{t("new_event_type_description")}</p>
        <CreateEventTypeButton canAddEvents={canAddEvents} options={profiles} />
      </div>
    </div>
  );
};

const EventTypesPage = () => {
  const { t } = useLocale();
  const query = trpc.useQuery(["viewer.eventTypes"]);

  return (
    <div>
      <Head>
        <title>Home | Cal.com</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Shell
        heading={t("event_types_page_title")}
        subtitle={t("event_types_page_subtitle")}
        CTA={
          query.data &&
          query.data.eventTypeGroups.length !== 0 && (
            <CreateEventTypeButton
              canAddEvents={query.data.viewer.canAddEvents}
              options={query.data.profiles}
            />
          )
        }>
        <QueryCell
          query={query}
          success={({ data }) => (
            <>
              {data.viewer.plan === "FREE" && !data.viewer.canAddEvents && (
                <Alert
                  severity="warning"
                  title={<>{t("plan_upgrade")}</>}
                  message={
                    <Trans i18nKey="plan_upgrade_instructions">
                      You can
                      <a href="/api/upgrade" className="underline">
                        upgrade here
                      </a>
                      .
                    </Trans>
                  }
                  className="mb-4"
                />
              )}
              {data.eventTypeGroups.map((group) => (
                <Fragment key={group.profile.slug}>
                  {/* hide list heading when there is only one (current user) */}
                  {(data.eventTypeGroups.length !== 1 || group.teamId) && (
                    <EventTypeListHeading
                      profile={group.profile}
                      membershipCount={group.metadata.membershipCount}
                    />
                  )}
                  <EventTypeList types={group.eventTypes} group={group} readOnly={group.metadata.readOnly} />
                </Fragment>
              ))}

              {data.eventTypeGroups.length === 0 && (
                <CreateFirstEventTypeView profiles={data.profiles} canAddEvents={data.viewer.canAddEvents} />
              )}
            </>
          )}
        />
      </Shell>
    </div>
  );
};

export default EventTypesPage;
