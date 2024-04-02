import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useVerifyCode } from "@calcom/features/bookings/Booker/components/hooks/useVerifyCode";
import { VerifyCodeDialog } from "@calcom/features/bookings/components/VerifyCodeDialog";
import { subdomainSuffix } from "@calcom/features/ee/organizations/lib/orgDomains";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import slugify from "@calcom/lib/slugify";
import { telemetryEventTypes, useTelemetry } from "@calcom/lib/telemetry";
import { trpc } from "@calcom/trpc/react";
import { Button, Form, TextField, Alert, SettingsToggle } from "@calcom/ui";
import { ArrowRight } from "@calcom/ui/components/icon";

function extractDomainFromEmail(email: string) {
  let out = "";
  try {
    const match = email.match(/^(?:.*?:\/\/)?.*?(?<root>[\w\-]*(?:\.\w{2,}|\.\w{2,}\.\w{2}))(?:[\/?#:]|$)/);
    out = (match && match.groups?.root) ?? "";
  } catch (ignore) {}
  return out.split(".")[0];
}

export const CreateANewOrganizationForm = ({ slug }: { slug?: string }) => {
  const { t, i18n } = useLocale();
  const router = useRouter();
  const telemetry = useTelemetry();
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(null);
  const [showVerifyCode, setShowVerifyCode] = useState(false);

  const newOrganizationFormMethods = useForm<{
    name: string;
    slug: string;
    adminEmail: string;
    adminUsername: string;
    isPlatform: boolean;
  }>({
    defaultValues: {
      slug: `${slug ?? ""}`,
      isPlatform: false,
    },
  });
  const watchAdminEmail = newOrganizationFormMethods.watch("adminEmail");

  const createOrganizationMutation = trpc.viewer.organizations.create.useMutation({
    onSuccess: async (data) => {
      if (data.checked) {
        setShowVerifyCode(true);
      } else if (data.user) {
        telemetry.event(telemetryEventTypes.org_created);
        await signIn("credentials", {
          redirect: false,
          callbackUrl: "/",
          email: data.user.email,
          password: data.user.password,
        });
        router.push(`/settings/organizations/${data.user.organizationId}/set-password`);
      }
    },
    onError: (err) => {
      if (err.message === "admin_email_taken") {
        newOrganizationFormMethods.setError("adminEmail", {
          type: "custom",
          message: t("email_already_used"),
        });
      } else if (err.message === "organization_url_taken") {
        newOrganizationFormMethods.setError("slug", { type: "custom", message: t("url_taken") });
      } else if (err.message === "domain_taken_team" || err.message === "domain_taken_project") {
        newOrganizationFormMethods.setError("slug", {
          type: "custom",
          message: t("problem_registering_domain"),
        });
      } else {
        setServerErrorMessage(err.message);
      }
    },
  });

  const verifyCode = useVerifyCode({
    onSuccess: (isVerified) => {
      if (isVerified) {
        createOrganizationMutation.mutate({
          ...newOrganizationFormMethods.getValues(),
          language: i18n.language,
          check: false,
        });
      }
    },
  });

  return (
    <>
      <Form
        form={newOrganizationFormMethods}
        id="createOrg"
        handleSubmit={(v) => {
          if (!createOrganizationMutation.isPending) {
            setServerErrorMessage(null);
            createOrganizationMutation.mutate(v);
          }
        }}>
        <div className="mb-5">
          {serverErrorMessage && (
            <div className="mb-4">
              <Alert severity="error" message={serverErrorMessage} />
            </div>
          )}

          <Controller
            name="adminEmail"
            control={newOrganizationFormMethods.control}
            defaultValue=""
            rules={{
              required: t("must_enter_organization_admin_email"),
            }}
            render={({ field: { value } }) => (
              <div className="flex">
                <TextField
                  containerClassName="w-full"
                  placeholder="john@acme.com"
                  name="adminEmail"
                  label={t("admin_email")}
                  defaultValue={value}
                  onChange={(e) => {
                    const domain = extractDomainFromEmail(e?.target.value);
                    newOrganizationFormMethods.setValue("adminEmail", e?.target.value.trim());
                    newOrganizationFormMethods.setValue(
                      "adminUsername",
                      e?.target.value.split("@")[0].trim()
                    );
                    if (newOrganizationFormMethods.getValues("slug") === "") {
                      newOrganizationFormMethods.setValue("slug", domain);
                    }
                    newOrganizationFormMethods.setValue(
                      "name",
                      domain.charAt(0).toUpperCase() + domain.slice(1)
                    );
                  }}
                  autoComplete="off"
                />
              </div>
            )}
          />
        </div>
        <div className="mb-5">
          <Controller
            name="name"
            control={newOrganizationFormMethods.control}
            defaultValue=""
            rules={{
              required: t("must_enter_organization_name"),
            }}
            render={({ field: { value } }) => (
              <>
                <TextField
                  className="mt-2"
                  placeholder="Acme"
                  name="name"
                  label={t("organization_name")}
                  defaultValue={value}
                  onChange={(e) => {
                    newOrganizationFormMethods.setValue("name", e?.target.value.trim());
                    if (newOrganizationFormMethods.formState.touchedFields["slug"] === undefined) {
                      newOrganizationFormMethods.setValue("slug", slugify(e?.target.value));
                    }
                  }}
                  autoComplete="off"
                />
              </>
            )}
          />
        </div>

        <div className="mb-5">
          <Controller
            name="slug"
            control={newOrganizationFormMethods.control}
            rules={{
              required: "Must enter organization slug",
            }}
            render={({ field: { value } }) => (
              <TextField
                className="mt-2"
                name="slug"
                label={t("organization_url")}
                placeholder="acme"
                addOnSuffix={`.${subdomainSuffix()}`}
                defaultValue={value}
                onChange={(e) => {
                  newOrganizationFormMethods.setValue("slug", slugify(e?.target.value), {
                    shouldTouch: true,
                  });
                  newOrganizationFormMethods.clearErrors("slug");
                }}
              />
            )}
          />
        </div>

        <div className="mb-5">
          <Controller
            name="isPlatform"
            control={newOrganizationFormMethods.control}
            defaultValue={false}
            render={({ field: { value } }) => (
              <div className="[&_label]:mt-1">
                <SettingsToggle
                  title={t("organization_is_platform")}
                  checked={value}
                  onCheckedChange={(checked) => {
                    newOrganizationFormMethods.setValue("isPlatform", checked);
                  }}
                />
              </div>
            )}
          />
        </div>

        <input hidden {...newOrganizationFormMethods.register("adminUsername")} />

        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            disabled={
              newOrganizationFormMethods.formState.isSubmitting || createOrganizationMutation.isPending
            }
            color="primary"
            EndIcon={ArrowRight}
            type="submit"
            form="createOrg"
            className="w-full justify-center">
            {t("continue")}
          </Button>
        </div>
      </Form>
      <VerifyCodeDialog
        isOpenDialog={showVerifyCode}
        setIsOpenDialog={setShowVerifyCode}
        email={watchAdminEmail}
        verifyCodeWithSessionNotRequired={verifyCode.verifyCodeWithSessionNotRequired}
        verifyCodeWithSessionRequired={verifyCode.verifyCodeWithSessionRequired}
        error={verifyCode.error}
        resetErrors={verifyCode.resetErrors}
        isPending={verifyCode.isPending}
        setIsPending={verifyCode.setIsPending}
      />
    </>
  );
};
