import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form";

import { CAL_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import showToast from "@calcom/lib/notification";
import { trpc } from "@calcom/trpc/react";
import { Icon } from "@calcom/ui";
import { Form } from "@calcom/ui/form/fields";
import { TextAreaField, TextField } from "@calcom/ui/v2";
import PublicEntityActions from "@calcom/ui/v2/core/PublicEntityActions";
import Shell from "@calcom/ui/v2/core/Shell";
import Banner from "@calcom/ui/v2/core/banner";

import RoutingNavBar from "../components/RoutingNavBar";
import { getSerializableForm } from "../lib/getSerializableForm";

const RoutingShell: React.FC<{
  form: ReturnType<typeof getSerializableForm>;
  heading: ReactNode;
  appUrl: string;
  children: ReactNode;
  setHookForm: () => void;
}> = function RoutingShell({ children, form, heading, appUrl, setHookForm }) {
  const { t } = useLocale();
  const router = useRouter();
  const utils = trpc.useContext();

  const mutation = trpc.useMutation("viewer.app_routing_forms.form", {
    onSuccess() {
      router.replace(router.asPath);
    },
    onError() {
      showToast(`Something went wrong`, "error");
    },
    onSettled() {
      utils.invalidateQueries(["viewer.app_routing_forms.form"]);
    },
  });

  const deleteMutation = trpc.useMutation("viewer.app_routing_forms.deleteForm", {
    onError() {
      showToast(`Something went wrong`, "error");
    },
    onSuccess() {
      router.push(`/${appUrl}/forms`);
    },
  });
  const fieldsNamespace = "fields";
  const hookForm = useForm({
    defaultValues: form,
  });

  useEffect(() => {
    setHookForm(hookForm);
  }, [hookForm]);

  const embedLink = `forms/${form.id}`;
  const formLink = `${CAL_URL}/${embedLink}`;

  return (
    <Form
      form={hookForm}
      handleSubmit={(data) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        mutation.mutate({
          ...data,
        });
      }}>
      <Shell
        heading={heading}
        backPath={`/${appUrl}/forms`}
        subtitle={form.description || ""}
        CTA={
          <PublicEntityActions
            saveAction={{
              mutation: mutation,
            }}
            toggleAction={{
              label: t("Enable Form"),
              mutation: mutation,
              value: !form.disabled,
              onAction: (isChecked) => {
                //TODO: Mutation should happen on save.
                mutation.mutate({ ...form, disabled: !isChecked });
              },
            }}
            embedAction={{
              label: "Embed",
              link: embedLink,
            }}
            previewAction={{ link: formLink, label: t("preview") }}
            downloadAction={{
              link: "/api/integrations/routing_forms/responses/" + form.id,
              label: "Download Responses",
            }}
            deleteAction={{
              title: "Delete Form",
              label: t("delete"),
              confirmationText:
                "Are you sure you want to delete this form? Anyone who you&apos;ve shared the link with will no longer be able to book using it.",
              confirmationBtnText: "Yes, delete form",
              mutation: deleteMutation,
              onAction: () => {
                deleteMutation.mutate({ id: form.id });
              },
            }}
          />
        }>
        <div className="-mx-4 px-4 sm:px-6 md:-mx-8 md:px-8">
          <div className="flex flex-col items-center md:flex-row md:items-start">
            <div className="min-w-72 max-w-72 mb-6 md:mr-6">
              <TextField
                type="text"
                containerClassName="mb-6"
                placeholder="Title"
                {...hookForm.register("name")}
              />
              <TextAreaField
                rows={3}
                id="description"
                data-testid="description"
                placeholder="Form Description"
                {...hookForm.register("description")}
                defaultValue={form.description || ""}
              />
              {!form._count.responses && (
                <Banner
                  className="mt-6"
                  variant="neutral"
                  title="No Responses yet"
                  description="Wait for some time for responses to be collected. You can go and submit the form yourself as well."
                  Icon={Icon.FiInfo}
                  onDismiss={() => console.log("dismissed")}
                />
              )}
            </div>
            <div className="w-full rounded-md border border-gray-200 p-8">
              <RoutingNavBar appUrl={appUrl} form={form} />
              {children}
            </div>
          </div>
        </div>
      </Shell>
    </Form>
  );
};
export default RoutingShell;
