import { useRouter } from "next/router";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import Meta from "@calcom/ui/v2/core/Meta";
import { getLayout } from "@calcom/ui/v2/core/layouts/AdminLayout";
import showToast from "@calcom/ui/v2/core/notifications";

import WebhookForm, { WebhookFormSubmitData } from "@components/v2/settings/webhook/WebhookForm";

const NewWebhookView = () => {
  const { t } = useLocale();
  const utils = trpc.useContext();
  const router = useRouter();
  //   const appId = props.app;
  const { data: webhooks } = trpc.useQuery(["viewer.webhook.list"], {
    suspense: true,
    enabled: router.isReady,
  });

  const createWebhookMutation = trpc.useMutation("viewer.webhook.create", {
    async onSuccess() {
      await utils.invalidateQueries(["viewer.webhook.list"]);
    },
    onError(error) {
      console.log(error);
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
    showToast(t("webhook_created_successfully"), "success");
    router.back();
  };

  return (
    <>
      <Meta title="add_webhook" description="add_webhook_description" backButton />

      <WebhookForm onSubmit={onCreateWebhook} />
    </>
  );
};

NewWebhookView.getLayout = getLayout;

export default NewWebhookView;
