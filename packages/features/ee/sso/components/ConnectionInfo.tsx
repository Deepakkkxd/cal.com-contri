import type { SSOConnection } from "@calcom/ee/sso/lib/saml";
import { APP_NAME } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import {
  Button,
  showToast,
  Tooltip,
  Icon,
  Label,
  ConfirmationDialogContent,
  Dialog,
  DialogTrigger,
} from "@calcom/ui";

export default function ConnectionInfo({
  teamId,
  connection,
}: {
  teamId: number | null;
  connection: SSOConnection;
}) {
  const { t } = useLocale();
  const utils = trpc.useContext();

  const connectionType = connection.type.toUpperCase();

  const mutation = trpc.viewer.saml.delete.useMutation({
    async onSuccess() {
      showToast(
        t("sso_connection_deleted_successfully", {
          connectionType,
        }),
        "success"
      );
      await utils.viewer.saml.get.invalidate();
    },
  });

  const deleteConnection = async () => {
    mutation.mutate({
      teamId,
    });
  };

  return (
    <>
      <div>
        {connection.type === "saml" ? (
          <SAMLInfo acsUrl={connection.acsUrl} entityId={connection.entityId} />
        ) : (
          <OIDCInfo callbackUrl={connection.defaultRedirectUrl} />
        )}
      </div>
      <Dialog>
        <div>
          <DialogTrigger asChild>
            <Button color="destructive">{t("delete_sso_configuration", { connectionType })}</Button>
          </DialogTrigger>
        </div>
        <ConfirmationDialogContent
          variety="danger"
          title={t("delete_sso_configuration", { connectionType })}
          confirmBtnText={t("delete_sso_configuration_confirmation", { connectionType })}
          onConfirm={deleteConnection}>
          {t("delete_sso_configuration_confirmation_description", { appName: APP_NAME, connectionType })}
        </ConfirmationDialogContent>
      </Dialog>
    </>
  );
}

const SAMLInfo = ({ acsUrl, entityId }: { acsUrl: string; entityId: string }) => {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <div className="flex">
          <Label>ACS URL</Label>
        </div>
        <div className="flex">
          <code className="flex w-full items-center truncate rounded rounded-r-none bg-gray-100 pl-2 font-mono text-gray-800">
            {acsUrl}
          </code>
          <Tooltip side="top" content={t("copy_to_clipboard")}>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(acsUrl);
                showToast(t("api_key_copied"), "success");
              }}
              type="button"
              className="rounded-l-none py-[19px] text-base ">
              <Icon.ClipboardCopyIcon className="h-5 w-5 text-gray-100 ltr:mr-2 rtl:ml-2" />
              {t("copy")}
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex">
          <Label>Entity ID</Label>
        </div>
        <div className="flex">
          <code className="flex w-full items-center truncate rounded rounded-r-none bg-gray-100 pl-2 font-mono text-gray-800">
            {entityId}
          </code>
          <Tooltip side="top" content={t("copy_to_clipboard")}>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(entityId);
                showToast(t("api_key_copied"), "success");
              }}
              type="button"
              className="rounded-l-none py-[19px] text-base ">
              <Icon.ClipboardCopyIcon className="h-5 w-5 text-gray-100 ltr:mr-2 rtl:ml-2" />
              {t("copy")}
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

const OIDCInfo = ({ callbackUrl }: { callbackUrl: string }) => {
  const { t } = useLocale();

  return (
    <div>
      <div className="flex flex-col">
        <div className="flex">
          <Label>Callback URL</Label>
        </div>
        <div className="flex">
          <code className="flex w-full items-center truncate rounded rounded-r-none bg-gray-100 pl-2 font-mono text-gray-800">
            {callbackUrl}
          </code>
          <Tooltip side="top" content={t("copy_to_clipboard")}>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(callbackUrl);
                showToast(t("api_key_copied"), "success");
              }}
              type="button"
              className="rounded-l-none py-[19px] text-base ">
              <Icon.ClipboardCopyIcon className="h-5 w-5 text-gray-100 ltr:mr-2 rtl:ml-2" />
              {t("copy")}
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
