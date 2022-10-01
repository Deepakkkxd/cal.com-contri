import { useRouter } from "next/router";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { SkeletonContainer } from "@calcom/ui/v2";
import Meta from "@calcom/ui/v2/core/Meta";
import { getLayout } from "@calcom/ui/v2/core/layouts/SettingsLayout";
import showToast from "@calcom/ui/v2/core/notifications";

import WebhookForm, { WebhookFormSubmitData } from "../components/WebhookForm";

const NewWebhookView = () => {
  const { t } = useLocale();
  const utils = trpc.useContext();
  const router = useRouter();
  const { data: installedApps, isLoading } = trpc.useQuery(
    ["viewer.integrations", { variant: "other", onlyInstalled: true }],
    {
      suspense: true,
      enabled: router.isReady,
    }
  );
  const { data: webhooks } = trpc.useQuery(["viewer.webhook.list"], {
    suspense: true,
    enabled: router.isReady,
  });

  const createWebhookMutation = trpc.useMutation("viewer.webhook.create", {
    async onSuccess() {
      showToast(t("webhook_created_successfully"), "success");
      await utils.invalidateQueries(["viewer.webhook.list"]);
      router.back();
    },
    onError(error) {
      showToast(`${error.message}`, "error");
    },
  });

  const subscriberUrlReserved = (subscriberUrl: string, id: string): boolean => {
    return !!webhooks?.find((webhook) => webhook.subscriberUrl === subscriberUrl && webhook.id !== id);
  };

  const onCreateWebhook = async (values: WebhookFormSubmitData) => {
    if (values.id && subscriberUrlReserved(values.subscriberUrl, values.id)) {
      showToast(t("webhook_subscriber_url_reserved"), "error");
      return;
    }

    if (!values.payloadTemplate) {
      values.payloadTemplate = null;
    }

    createWebhookMutation.mutate({
      subscriberUrl: values.subscriberUrl,
      eventTriggers: values.eventTriggers,
      active: values.active,
      payloadTemplate: values.payloadTemplate,
      secret: values.secret,
    });
  };

  if (isLoading) return <SkeletonContainer />;

  return (
    <>
      <Meta
        title="Add Webhook"
        description="Receive meeting data in real-time when something happens in Cal.com"
        backButton
      />

      <WebhookForm onSubmit={onCreateWebhook} apps={installedApps?.items.map((app) => app.slug)} />
    </>
  );
};

NewWebhookView.getLayout = getLayout;

export default NewWebhookView;
