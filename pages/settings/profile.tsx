import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { RefObject, useEffect, useRef, useState } from "react";
import prisma from "@lib/prisma";
import Modal from "@components/Modal";
import Shell from "@components/Shell";
import SettingsShell from "@components/Settings";
import Avatar from "@components/ui/Avatar";
import { getSession } from "@lib/auth";
import Select from "react-select";
import TimezoneSelect from "react-timezone-select";
import { UsernameInput } from "@components/ui/UsernameInput";
import ErrorAlert from "@components/ui/alerts/Error";
import ImageUploader from "@components/ImageUploader";
import crypto from "crypto";
import { inferSSRProps } from "@lib/types/inferSSRProps";
import Badge from "@components/ui/Badge";
import Button from "@components/ui/Button";
import { isBrandingHidden } from "@lib/isBrandingHidden";

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

type Props = inferSSRProps<typeof getServerSideProps>;
function HideBrandingInput(props: {
  //
  hideBrandingRef: RefObject<HTMLInputElement>;
  user: Props["user"];
}) {
  const [modelOpen, setModalOpen] = useState(false);
  return (
    <>
      <input
        id="hide-branding"
        name="hide-branding"
        type="checkbox"
        ref={props.hideBrandingRef}
        defaultChecked={isBrandingHidden(props.user)}
        className={
          "focus:ring-neutral-500 h-4 w-4 text-neutral-900 border-gray-300 rounded-sm disabled:opacity-50 hover:checked:bg-black checked:bg-black"
        }
        onClick={(e) => {
          if (!e.currentTarget.checked || props.user.plan !== "FREE") {
            return;
          }

          // prevent checking the input
          e.preventDefault();

          setModalOpen(true);
        }}
      />

      <Modal
        heading="This feature is only available in paid plan"
        variant="warning"
        description={
          <div className="flex flex-col space-y-3">
            <p>
              In order to remove the Cal branding from your booking pages, you need to upgrade to a paid
              account.
            </p>

            <p>
              {" "}
              To upgrade go to{" "}
              <a href="https://cal.com/upgrade" className="underline">
                cal.com/upgrade
              </a>
              .
            </p>
          </div>
        }
        open={modelOpen}
        handleClose={() => setModalOpen(false)}
      />
    </>
  );
}

export default function Settings(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>();
  const avatarRef = useRef<HTMLInputElement>(null);
  const hideBrandingRef = useRef<HTMLInputElement>(null);
  const [asyncUseCalendar, setAsyncUseCalendar] = useState({ value: props.user.asyncUseCalendar });
  const [selectedTheme, setSelectedTheme] = useState({ value: props.user.theme });
  const [selectedTimeZone, setSelectedTimeZone] = useState({ value: props.user.timeZone });
  const [selectedWeekStartDay, setSelectedWeekStartDay] = useState({ value: props.user.weekStart });
  const [imageSrc, setImageSrc] = useState<string>(props.user.avatar);

  const [hasErrors, setHasErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setSelectedTheme(
      props.user.theme ? themeOptions.find((theme) => theme.value === props.user.theme) : null
    );
    setSelectedWeekStartDay({ value: props.user.weekStart, label: props.user.weekStart });
  }, []);

  const closeSuccessModal = () => {
    setSuccessModalOpen(false);
  };

  const handleAvatarChange = (newAvatar) => {
    avatarRef.current.value = newAvatar;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    nativeInputValueSetter.call(avatarRef.current, newAvatar);
    const ev2 = new Event("input", { bubbles: true });
    avatarRef.current.dispatchEvent(ev2);
    updateProfileHandler(ev2);
    setImageSrc(newAvatar);
  };

  const handleError = async (resp) => {
    if (!resp.ok) {
      const error = await resp.json();
      throw new Error(error.message);
    }
  };

  async function updateProfileHandler(event) {
    event.preventDefault();

    const enteredUsername = usernameRef.current.value.toLowerCase();
    const enteredName = nameRef.current.value;
    const enteredDescription = descriptionRef.current.value;
    const enteredAvatar = avatarRef.current.value;
    const enteredTimeZone = selectedTimeZone.value;
    const enteredWeekStartDay = selectedWeekStartDay.value;
    const enteredHideBranding = hideBrandingRef.current.checked;
    const enteredAsyncUseCalendar = asyncUseCalendar.value;

    // TODO: Add validation

    await fetch("/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({
        username: enteredUsername,
        name: enteredName,
        description: enteredDescription,
        avatar: enteredAvatar,
        timeZone: enteredTimeZone,
        weekStart: enteredWeekStartDay,
        hideBranding: enteredHideBranding,
        theme: selectedTheme ? selectedTheme.value : null,
        asyncUseCalendar: enteredAsyncUseCalendar,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(handleError)
      .then(() => {
        setSuccessModalOpen(true);
        setHasErrors(false); // dismiss any open errors
      })
      .catch((err) => {
        setHasErrors(true);
        setErrorMessage(err.message);
      });
  }

  return (
    <Shell heading="Profile" subtitle="Edit your profile information, which shows on your scheduling link.">
      <SettingsShell>
        <form className="divide-y divide-gray-200 lg:col-span-9" onSubmit={updateProfileHandler}>
          {hasErrors && <ErrorAlert message={errorMessage} />}
          <div className="py-6 lg:pb-8">
            <div className="flex flex-col lg:flex-row">
              <div className="flex-grow space-y-6">
                <div className="block sm:flex">
                  <div className="w-full mb-6 sm:w-1/2 sm:mr-2">
                    <UsernameInput disabled ref={usernameRef} defaultValue={props.user.username} />
                  </div>
                  <div className="w-full sm:w-1/2 sm:ml-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full name
                    </label>
                    <input
                      disabled
                      ref={nameRef}
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="given-name"
                      placeholder="Your name"
                      required
                      className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-600 bg-gray-300 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      defaultValue={props.user.name}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                    About
                  </label>
                  <div className="mt-1">
                    <textarea
                      ref={descriptionRef}
                      id="about"
                      name="about"
                      placeholder="A little something about yourself."
                      rows={3}
                      defaultValue={props.user.bio}
                      className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-600 bg-gray-300 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"></textarea>
                  </div>
                </div>
                <div>
                  <div className="flex mt-1">
                    <Avatar
                      displayName={props.user.name}
                      className="relative w-10 h-10 rounded-full"
                      gravatarFallbackMd5={props.user.emailMd5}
                      imageSrc={imageSrc}
                    />
                    <input
                      ref={avatarRef}
                      type="hidden"
                      name="avatar"
                      id="avatar"
                      placeholder="URL"
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm"
                      defaultValue={imageSrc}
                    />
                    <ImageUploader
                      noChange
                      target="avatar"
                      id="avatar-upload"
                      buttonMsg="Change avatar"
                      handleAvatarChange={handleAvatarChange}
                      imageRef={imageSrc}
                    />
                  </div>
                  <hr className="mt-6" />
                </div>
                <div>
                  <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700">
                    Timezone
                  </label>
                  <div className="mt-1">
                    <TimezoneSelect
                      id="timeZone"
                      value={selectedTimeZone}
                      onChange={setSelectedTimeZone}
                      classNamePrefix="react-select"
                      className="block w-full mt-1 border border-gray-300 rounded-sm shadow-sm react-select-container focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="weekStart" className="block text-sm font-medium text-gray-700">
                    First Day of Week
                  </label>
                  <div className="mt-1">
                    <Select
                      id="weekStart"
                      value={selectedWeekStartDay}
                      onChange={setSelectedWeekStartDay}
                      classNamePrefix="react-select"
                      className="block w-full mt-1 border border-gray-300 rounded-sm shadow-sm react-select-container focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm"
                      options={[
                        { value: "Sunday", label: "Sunday" },
                        { value: "Monday", label: "Monday" },
                      ]}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                    Single Theme
                  </label>
                  <div className="my-1">
                    <Select
                      id="theme"
                      isDisabled={!selectedTheme}
                      defaultValue={selectedTheme || themeOptions[0]}
                      value={selectedTheme || themeOptions[0]}
                      onChange={setSelectedTheme}
                      className="block w-full mt-1 border-gray-300 rounded-sm shadow-sm focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm"
                      options={themeOptions}
                    />
                  </div>
                  <div className="relative flex items-start mt-8">
                    <div className="flex items-center h-5">
                      <input
                        id="async-use-calendar"
                        name="async-use-calendar"
                        type="checkbox"
                        onChange={(e) => setAsyncUseCalendar({ value: e.target.checked })}
                        defaultChecked={asyncUseCalendar.value}
                        className="w-4 h-4 border-gray-300 rounded-sm hover:checked:bg-black checked:bg-black focus:ring-neutral-500 text-neutral-900"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="async-use-calendar" className="font-medium text-gray-700">
                        Async meetings schedule a space in your calendar
                      </label>
                    </div>
                  </div>
                  <div className="relative flex items-start mt-8">
                    <div className="flex items-center h-5">
                      <input
                        id="theme-adjust-os"
                        name="theme-adjust-os"
                        type="checkbox"
                        onChange={(e) => setSelectedTheme(e.target.checked ? null : themeOptions[0])}
                        defaultChecked={!selectedTheme}
                        className="w-4 h-4 border-gray-300 rounded-sm hover:checked:bg-black checked:bg-black focus:ring-neutral-500 text-neutral-900"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="theme-adjust-os" className="font-medium text-gray-700">
                        Automatically adjust theme based on invitee preferences
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <HideBrandingInput user={props.user} hideBrandingRef={hideBrandingRef} />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="hide-branding" className="font-medium text-gray-700">
                        Disable Yac branding{" "}
                        {props.user.plan !== "PRO" && <Badge variant="default">PRO</Badge>}
                      </label>
                      <p className="text-gray-500">Hide all Yac branding from your public pages.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/*<div className="flex-grow mt-6 lg:mt-0 lg:ml-6 lg:flex-grow-0 lg:flex-shrink-0">
                <p className="mb-2 text-sm font-medium text-gray-700" aria-hidden="true">
                  Photo
                </p>
                <div className="mt-1 lg:hidden">
                  <div className="flex items-center">
                    <div
                      className="flex-shrink-0 inline-block w-12 h-12 overflow-hidden rounded-full"
                      aria-hidden="true">
                      <Avatar user={props.user} className="w-full h-full rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="relative hidden overflow-hidden rounded-full lg:block">
                  <Avatar
                    user={props.user}
                    className="relative w-40 h-40 rounded-full"
                    fallback={<div className="relative w-40 h-40 rounded-full bg-neutral-900"></div>}
                  />
                </div>
                <div className="mt-4">
                  <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                    Avatar URL
                  </label>
                  <input
                    ref={avatarRef}
                    type="text"
                    name="avatar"
                    id="avatar"
                    placeholder="URL"
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm"
                    defaultValue={props.user.avatar}
                  />
                </div>
              </div>*/}
            </div>
            <hr className="mt-8" />
            <div className="flex justify-end py-4">
              <Button type="submit">Save</Button>
            </div>
          </div>
        </form>
        <Modal
          heading="Profile updated successfully"
          description="Your user profile has been updated successfully."
          open={successModalOpen}
          handleClose={closeSuccessModal}
        />
      </SettingsShell>
    </Shell>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
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
      asyncUseCalendar: true,
    },
  });

  if (!user) {
    throw new Error("User seems logged in but cannot be found in the db");
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
