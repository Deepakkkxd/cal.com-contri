import { useCreateOAuthClient } from "@pages/settings/organizations/platform/oauth-clients/hooks/usePersistOAuthClient";
import { useRouter } from "next/router";
import type { FC } from "react";
import React from "react";
import { useForm } from "react-hook-form";

import { PERMISSIONS_GROUPED_MAP } from "@calcom/platform-constants/permissions";
import { showToast } from "@calcom/ui";
import { Meta, Button, TextField } from "@calcom/ui";

type FormValues = {
  name: string;
  logo?: string;
  redirect_uri: string;
  redirect_uris: string[];
  permissions: number;
  eventTypeRead: boolean;
  eventTypeWrite: boolean;
  bookingRead: boolean;
  bookingWrite: boolean;
  scheduleRead: boolean;
  scheduleWrite: boolean;
};

export const OAuthClientForm: FC = () => {
  const { register, handleSubmit, control, setValue } = useForm<FormValues>({});
  const router = useRouter();

  const { mutateAsync, isLoading } = useCreateOAuthClient({
    onSuccess: () => {
      showToast("OAuth client created successfully", "success");
      router.push("/settings/organizations/platform/oauth-clients");
    },
    onError: () => {
      showToast("Internal server error, please try again later", "error");
    },
  });

  const onSubmit = (data: FormValues) => {
    let userPermissions = 0;
    Object.keys(PERMISSIONS_GROUPED_MAP).forEach((key) => {
      const entity = key as keyof typeof PERMISSIONS_GROUPED_MAP;
      const entityKey = PERMISSIONS_GROUPED_MAP[entity].key;
      const read = PERMISSIONS_GROUPED_MAP[entity].read;
      const write = PERMISSIONS_GROUPED_MAP[entity].write;
      if (data[`${entityKey}Read`]) userPermissions |= read;
      if (data[`${entityKey}Write`]) userPermissions |= write;
    });

    mutateAsync({
      name: data.name,
      permissions: userPermissions,
      // logo: data.logo,
      redirect_uris: [data.redirect_uri],
    });
  };

  const permissionsCheckboxes = Object.keys(PERMISSIONS_GROUPED_MAP).map((key) => {
    const entity = key as keyof typeof PERMISSIONS_GROUPED_MAP;
    const label = PERMISSIONS_GROUPED_MAP[entity].key;

    return (
      <div className="mt-3" key={key}>
        <p className="text-sm font-semibold">{label}</p>
        <div className="mt-1 flex gap-x-5">
          <div className="flex items-center gap-x-2">
            <input
              {...register(`${label}Read`)}
              className="bg-default border-default h-4 w-4 shrink-0 rounded-[4px] border ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
              type="checkbox"
            />
            <label className="text-sm">Read</label>
          </div>
          <div className="flex items-center gap-x-2">
            <input
              {...register(`${label}Write`)}
              className="bg-default border-default h-4 w-4 shrink-0 rounded-[4px] border ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
              type="checkbox"
            />
            <label className="text-sm">Write</label>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div>
      <Meta
        title="OAuth client creation form"
        description="This is a form to create a new OAuth client"
        borderInShellHeader={true}
      />
      <form
        className="border-subtle rounded-b-lg border border-t-0 px-4 pb-8 pt-2"
        onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-6">
          <TextField required={true} label="Client name" {...register("name")} />
        </div>
        {/** <div className="mt-6">
          <Controller
            control={control}
            name="logo"
            render={({ field: { value } }) => (
              <>
                <Label>Client logo</Label>
                <div className="flex items-center">
                  <Avatar
                    alt=""
                    imageSrc={value}
                    fallback={<Plus className="text-subtle h-4 w-4" />}
                    size="sm"
                  />
                  <div className="ms-4">
                    <ImageUploader
                      target="avatar"
                      id="vatar-upload"
                      buttonMsg="Upload"
                      imageSrc={value}
                      handleAvatarChange={(newAvatar: string) => {
                        setValue("logo", newAvatar);
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          />
        </div> */}
        <div className="mt-6">
          <TextField label="Redirect uri" required={true} {...register("redirect_uri")} />
        </div>
        <div className="mt-6">
          <h1 className="text-base font-semibold underline">Permissions</h1>
          <div>{permissionsCheckboxes}</div>
        </div>
        <Button className="mt-6" type="submit" loading={isLoading}>
          Submit
        </Button>
      </form>
    </div>
  );
};
