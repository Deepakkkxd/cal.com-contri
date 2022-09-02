import { GetServerSidePropsContext } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { getSession } from "@calcom/lib/auth";
import { User } from "@calcom/prisma/client";

import prisma from "@lib/prisma";

import { StepCard } from "@components/getting-started/components/StepCard";
import { Steps } from "@components/getting-started/components/Steps";
import { ConnectedCalendars } from "@components/getting-started/steps-views/ConnectCalendars";
import { SetupAvailability } from "@components/getting-started/steps-views/SetupAvailability";
import UserProfile from "@components/getting-started/steps-views/UserProfile";
import { UserSettings } from "@components/getting-started/steps-views/UserSettings";

interface IOnboardingPageProps {
  user: User;
}

const steps = ["user-settings", "connected-calendar", "setup-availability", "user-profile"];

const stepTransform = (step: string) => {
  const stepIndex = steps.indexOf(step);
  if (stepIndex > -1) {
    return steps[stepIndex];
  }
  return "user-settings";
};

const OnboardingPage = (props: IOnboardingPageProps) => {
  const router = useRouter();
  const { step: stepString } = router.query;

  const { user } = props;
  const { t } = useTranslation();

  const initialStep = stepString === undefined ? steps[0] : stepTransform(stepString[0]);

  const [currentStep, setCurrentStep] = useState(initialStep);

  const headers = [
    {
      title: `${t("welcome_to_calcom")}!`,
      subtitle: ["We just need some basic info to get your profile setup."],
      skipText: "Skip",
    },
    {
      title: `Connect your calendar`,
      subtitle: [
        "Connect your calendar to automatically check for busy times and new events as they’re scheduled.",
      ],
      skipText: "Do this later",
    },
    {
      title: "Set your availability",
      subtitle: [
        "Define ranges of time when you are available.",
        "You can customise all of this later in the availability page.",
      ],
      skipText: "Do this later",
    },
    {
      title: "Nearly there!",
      subtitle: [
        "Last thing, a brief description about you and a photo really help you get bookings and let people know who they’re booking with.",
      ],
    },
  ];

  const goToStep = (step: string) => {
    const newStep = stepTransform(step);
    setCurrentStep(newStep);
    router.push(
      {
        pathname: `/getting-started/${stepTransform(step)}`,
      },
      undefined
    );
  };

  const goToIndex = (index: number) => {
    const newStep = steps[index];
    setCurrentStep(newStep);
    router.push(
      {
        pathname: `/getting-started/${stepTransform(newStep)}`,
      },
      undefined
    );
  };

  // Transform any invalid step to a valid step
  useEffect(() => {
    const initialStep = router.query.step === undefined ? 0 : stepTransform(router.query.step[0]);
    if (initialStep > steps.length) {
      router.push(
        {
          pathname: "/getting-started/user-settings",
        },
        undefined,
        { shallow: true }
      );
    }
  }, []);
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div
      className="dark:bg-brand dark:text-brand-contrast min-h-screen text-black"
      data-testid="onboarding"
      key={router.asPath}>
      <Head>
        <title>Cal.com - {t("getting_started")}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-auto px-4 py-24">
        <div className="relative">
          <div className="sm:mx-auto sm:w-full sm:max-w-[600px]">
            <div className="mx-auto sm:max-w-lg">
              <header>
                <p className="font-cal mb-2 text-[28px] tracking-wider">
                  {headers[currentStepIndex]?.title || "Undefined title"}
                </p>

                {headers[currentStepIndex]?.subtitle.map((subtitle, index) => (
                  <p className="text-sm font-normal text-gray-500" key={index}>
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
                <SetupAvailability nextStep={() => goToIndex(3)} defaultScheduleId={user.defaultScheduleId} />
              )}

              {currentStep === "user-profile" && <UserProfile user={user} />}
            </StepCard>
            {headers[currentStepIndex]?.skipText && (
              <div className="flex w-full flex-row justify-center">
                <a
                  onClick={(event) => {
                    event.preventDefault();
                    goToIndex(currentStepIndex + 1);
                  }}
                  className="text-md mt-[46px] cursor-pointer px-4 py-2">
                  {headers[currentStepIndex]?.skipText}
                </a>
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

  const user = await prisma.user.findUnique({
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
    },
  });

  if (!user) {
    throw new Error("User from session not found");
  }

  return {
    props: {
      user: {
        ...user,
        emailMd5: crypto.createHash("md5").update(user.email).digest("hex"),
      },
    },
  };
};

export default OnboardingPage;
