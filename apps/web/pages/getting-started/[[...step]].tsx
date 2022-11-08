import { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import { z } from "zod";

import { getSession } from "@calcom/lib/auth";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { User } from "@calcom/prisma/client";
import { Button } from "@calcom/ui/components/button";

import prisma from "@lib/prisma";

import { StepCard } from "@components/getting-started/components/StepCard";
import { Steps } from "@components/getting-started/components/Steps";
import { ConnectedCalendars } from "@components/getting-started/steps-views/ConnectCalendars";
import { SetupAvailability } from "@components/getting-started/steps-views/SetupAvailability";
import { UserSettings } from "@components/getting-started/steps-views/UserSettings";

interface IOnboardingPageProps {
  user: User;
}

const INITIAL_STEP = "user-settings";
const steps = ["user-settings", "connected-calendar", "setup-availability"] as const;

const stepTransform = (step: typeof steps[number]) => {
  const stepIndex = steps.indexOf(step);
  if (stepIndex > -1) {
    return steps[stepIndex];
  }
  return INITIAL_STEP;
};

const stepRouteSchema = z.object({
  step: z.array(z.enum(steps)).default([INITIAL_STEP]),
});

const OnboardingPage = (props: IOnboardingPageProps) => {
  const router = useRouter();

  const { user } = props;
  const { t } = useLocale();

  const result = stepRouteSchema.safeParse(router.query);
  const currentStep = result.success ? result.data.step[0] : INITIAL_STEP;

  const headers = [
    {
      title: `${t("welcome_to_cal_header")}`,
      subtitle: [`${t("we_just_need_basic_info")}`],
    },
    {
      title: `${t("connect_your_calendar")}`,
      subtitle: [`${t("connect_your_calendar_instructions")}`],
      skipText: `${t("connect_calendar_later")}`,
    },
    {
      title: `${t("set_availability")}`,
      subtitle: [
        `${t("set_availability_getting_started_subtitle_1")}`,
        `${t("set_availability_getting_started_subtitle_2")}`,
      ],
    },
  ];

  const goToIndex = (index: number) => {
    const newStep = steps[index];
    router.push(
      {
        pathname: `/getting-started/${stepTransform(newStep)}`,
      },
      undefined
    );
  };

  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div
      className="bg-sunny-100 dark:text-brand-contrast min-h-screen text-black"
      data-testid="onboarding"
      key={router.asPath}>
      <Head>
        <title>Cal.com - {t("getting_started")}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex items-center justify-center p-4">
        <img
          src="https://mento-space.nyc3.digitaloceanspaces.com/logo.svg"
          alt="logo"
          width="100"
          height="40"
        />
      </div>

      <div className="mx-auto px-4 py-6 md:py-24">
        <div className="relative">
          <div className="sm:mx-auto sm:w-full sm:max-w-[600px]">
            <div className="mx-auto sm:max-w-[520px]">
              <header>
                <p className="font-cal mb-3 text-[28px] font-medium leading-7">
                  {headers[currentStepIndex]?.title || "Undefined title"}
                </p>

                {headers[currentStepIndex]?.subtitle.map((subtitle, index) => (
                  <p className="font-sans text-sm font-normal text-gray-500" key={index}>
                    {subtitle}
                  </p>
                ))}
              </header>
              <Steps maxSteps={steps.length} currentStep={currentStepIndex} navigateToStep={goToIndex} />
            </div>
            <StepCard>
              {currentStep === "user-settings" && <UserSettings user={user} nextStep={() => goToIndex(1)} />}

              {currentStep === "connected-calendar" && <ConnectedCalendars nextStep={() => goToIndex(2)} />}

              {currentStep === "setup-availability" && (
                <SetupAvailability
                  nextStep={() => router.push("/getting-started/onboarded")}
                  defaultScheduleId={user.defaultScheduleId}
                />
              )}
            </StepCard>
            {headers[currentStepIndex]?.skipText && (
              <div className="flex w-full flex-row justify-center">
                <Button
                  color="minimalSecondary"
                  data-testid="skip-step"
                  onClick={(event) => {
                    event.preventDefault();
                    goToIndex(currentStepIndex + 1);
                  }}
                  className="mt-8 cursor-pointer px-4 py-2 font-sans text-sm font-medium">
                  {headers[currentStepIndex]?.skipText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const crypto = await import("crypto");
  const session = await getSession(context);

  if (!session?.user?.id) {
    return { redirect: { permanent: false, destination: "/auth/login" } };
  }

  let user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      bio: true,
      avatar: true,
      timeZone: true,
      weekStart: true,
      hideBranding: true,
      theme: true,
      plan: true,
      brandColor: true,
      darkBrandColor: true,
      metadata: true,
      timeFormat: true,
      allowDynamicBooking: true,
      defaultScheduleId: true,
      completedOnboarding: true,
    },
  });

  if (!user) {
    throw new Error("User from session not found");
  }

  // CUSTOM_CODE: Update Properties from App DB
  if (process.env?.NEXT_PUBLIC_MENTO_COACH_URL && process.env?.NEXT_PUBLIC_CALENDAR_KEY) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MENTO_COACH_URL}/api/calendar/coach?email=${user?.email}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + process.env.NEXT_PUBLIC_CALENDAR_KEY,
          },
        }
      );
      const data = await response?.json();

      if (data) {
        user = { ...user, name: data?.name, bio: data?.bio, avatar: data?.profileUrl };
      }
    } catch (e) {
      console.error(e);
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "", ["common"])),
      user: {
        ...user,
        emailMd5: crypto.createHash("md5").update(user.email).digest("hex"),
      },
    },
  };
};

export default OnboardingPage;
