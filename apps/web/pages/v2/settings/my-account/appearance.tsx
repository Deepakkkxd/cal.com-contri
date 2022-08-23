import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Icon } from "@calcom/ui";
import Avatar from "@calcom/ui/v2/core/Avatar";
import Badge from "@calcom/ui/v2/core/Badge";
import { Button } from "@calcom/ui/v2/core/Button";
import Loader from "@calcom/ui/v2/core/Loader";
import Switch from "@calcom/ui/v2/core/Switch";
import TimezoneSelect from "@calcom/ui/v2/core/TimezoneSelect";
import ColorPicker from "@calcom/ui/v2/core/colorpicker";
import Select from "@calcom/ui/v2/core/form/Select";
import { TextField, Form, Label } from "@calcom/ui/v2/core/form/fields";
import { getLayout } from "@calcom/ui/v2/core/layouts/AdminLayout";
import showToast from "@calcom/ui/v2/core/notfications";

import { getSession } from "@lib/auth";
import { inferSSRProps } from "@lib/types/inferSSRProps";

const AppearanceView = (props: inferSSRProps<typeof getServerSideProps>) => {
  const { t } = useLocale();
  const { user } = props;

  const [chooseBrandColors, setChooseBrandColors] = useState(
    user.brandColor === "#292929" && user.darkBrandColor === "#fafafa" ? false : true
  );

  const mutation = trpc.useMutation("viewer.updateProfile", {
    onSuccess: () => {
      showToast("Profile updated successfully", "success");
    },
    onError: () => {
      showToast("Error updating profile", "error");
    },
  });

  const themeOptions = [
    { value: "light", label: t("light") },
    { value: "dark", label: t("dark") },
  ];

  const formMethods = useForm();

  return (
    <Form
      form={formMethods}
      handleSubmit={(values) => {
        mutation.mutate({
          ...values,
          theme: values.theme.value,
        });
      }}>
      <Controller
        name="theme"
        control={formMethods.control}
        defaultValue={user.theme}
        render={({ field: { value } }) => (
          <>
            <div className="flex items-center">
              <div>
                <p className="font-semibold">Follow system preferences</p>
                <p className="text-gray-600">
                  Automatically adjust theme based on invitee system preferences. Note: This only applies to
                  the booking pages.
                </p>
              </div>
              <Switch
                onCheckedChange={(checked) => formMethods.setValue("theme", checked ? null : themeOptions[0])}
                checked={!value}
              />
            </div>
            <div>
              <Select
                options={themeOptions}
                onChange={(event) => {
                  if (event) formMethods.setValue("theme", { ...event });
                }}
                isDisabled={!value}
                defaultValue={value || themeOptions[0]}
                value={value || themeOptions[0]}
              />
            </div>
          </>
        )}
      />

      <hr className="border-1 my-6 border-neutral-200" />
      <div className="flex items-center">
        <div>
          <p className="font-semibold">Custom brand colours</p>
          <p className="text-gray-600">Customise your own brand colour into your booking page.</p>
        </div>
        {/* <Switch onCheckedChange={(checked) => setChooseBrandColors(checked)} checked={chooseBrandColors} /> */}
      </div>

      <div className="flex">
        <Controller
          name="brandColor"
          control={formMethods.control}
          defaultValue={user.brandColor}
          render={({ field: { value } }) => (
            <div>
              <p className="block text-sm font-medium text-gray-900">{t("light_brand_color")}</p>
              <ColorPicker
                defaultValue={user.brandColor}
                onChange={(value) => formMethods.setValue("brandColor", value)}
              />
            </div>
          )}
        />
        <Controller
          name="darkBrandColor"
          control={formMethods.control}
          defaultValue={user.darkBrandColor}
          render={({ field: { value } }) => (
            <div>
              <p className="block text-sm font-medium text-gray-900">{t("dark_brand_color")}</p>
              <ColorPicker
                defaultValue={user.darkBrandColor}
                onChange={(value) => formMethods.setValue("darkBrandColor", value)}
              />
            </div>
          )}
        />
      </div>

      <hr className="border-1 my-6 border-neutral-200" />
      <Controller
        name="hideBranding"
        control={formMethods.control}
        defaultValue={user.hideBranding}
        render={({ field: { value } }) => (
          <>
            <div className="flex items-center">
              <div>
                <div className="flex items-center">
                  <p className="mr-2 font-semibold">Disable Cal branding</p> <Badge variant="gray">Pro</Badge>
                </div>
                <p className="text-gray-600">Removes any Cal related brandings, i.e. ‘Powered by Cal.’</p>
              </div>
              <Switch
                onCheckedChange={(checked) => formMethods.setValue("hideBranding", checked)}
                checked={value}
              />
            </div>
          </>
        )}
      />
      <Button color="primary" className="mt-8">
        Update
      </Button>
    </Form>
  );
};

AppearanceView.getLayout = getLayout;

export default AppearanceView;

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
      timeZone: true,
      timeFormat: true,
      weekStart: true,
      brandColor: true,
      darkBrandColor: true,
    },
  });

  if (!user) {
    throw new Error("User seems logged in but cannot be found in the db");
  }

  return {
    props: {
      user,
    },
  };
};
