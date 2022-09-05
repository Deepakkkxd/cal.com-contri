import { ArrowRightIcon, ClockIcon } from "@heroicons/react/outline";
import { useTranslation } from "next-i18next";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import dayjs from "@calcom/dayjs";
import { User } from "@calcom/prisma/client";
import { trpc } from "@calcom/trpc/react";
import TimezoneSelect from "@calcom/ui/form/TimezoneSelect";
import { Button } from "@calcom/ui/v2";

import { UsernameAvailability } from "@components/ui/UsernameAvailability";

interface IUserSettingsProps {
  user: User;
  nextStep: () => void;
}

type FormData = {
  name: string;
};

const UserSettings = (props: IUserSettingsProps) => {
  const { user, nextStep } = props;
  const { t } = useTranslation();
  const [selectedTimeZone, setSelectedTimeZone] = useState(user.timeZone ?? dayjs.tz.guess());
  const { register, handleSubmit, formState } = useForm<FormData>({
    defaultValues: {
      name: user?.name || undefined,
    },
    reValidateMode: "onChange",
  });
  const { errors } = formState;
  const defaultOptions = { required: true, maxLength: 255 };

  const utils = trpc.useContext();
  const onSuccess = async () => {
    await utils.invalidateQueries(["viewer.me"]);
    nextStep();
  };
  const mutation = trpc.useMutation("viewer.updateProfile", {
    onSuccess: onSuccess,
  });
  const onSubmit = handleSubmit((data) => {
    mutation.mutate({
      name: data.name,
      timeZone: selectedTimeZone,
    });
  });
  const [currentUsername, setCurrentUsername] = useState(user.username || undefined);
  const [inputUsernameValue, setInputUsernameValue] = useState(currentUsername);
  const usernameRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        {/* Username textfield */}
        <UsernameAvailability
          currentUsername={currentUsername}
          setCurrentUsername={setCurrentUsername}
          inputUsernameValue={inputUsernameValue}
          usernameRef={usernameRef}
          setInputUsernameValue={setInputUsernameValue}
          user={user}
        />

        {/* Full name textfield */}
        <div className="w-full">
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
            {t("full_name")}
          </label>
          <input
            {...register("name", defaultOptions)}
            id="name"
            name="name"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            className="w-full rounded-md border border-gray-300 text-sm"
          />
          {errors.name && <p className="text-xs italic text-red-500">{t("required")}</p>}
        </div>
        {/* Timezone select field */}
        <div className="w-full">
          <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700">
            {t("timezone")}
          </label>

          <TimezoneSelect
            id="timeZone"
            value={selectedTimeZone}
            onChange={({ value }) => setSelectedTimeZone(value)}
            className="mt-2 w-full rounded-md border border-gray-300 text-sm"
          />

          <p className="font-cal mt-3 flex flex-row text-xs leading-tight text-gray-500 dark:text-white">
            <ClockIcon className="mr-1 h-[14px] w-[14px] self-center text-gray-500" />
            {t("current") + " " + t("timezone").toLocaleLowerCase()}&nbsp;
            {dayjs().tz(selectedTimeZone).format("LT").toString()}
          </p>
        </div>
      </div>
      <Button
        type="submit"
        className="mt-11 flex w-full flex-row justify-center"
        disabled={mutation.isLoading}>
        {t("next_step_text")}
        <ArrowRightIcon className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
      </Button>
    </form>
  );
};

export { UserSettings };
