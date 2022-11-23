import DOMPurify from "dompurify";
import { useSession } from "next-auth/react";
import React, { AriaRole, ComponentType, Fragment } from "react";

import { CONSOLE_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { EmptyScreen, Icon } from "@calcom/ui";

type LicenseRequiredProps = {
  as?: keyof JSX.IntrinsicElements | "";
  className?: string;
  role?: AriaRole | undefined;
  children: React.ReactNode;
};

/**
 * This component will only render it's children if the installation has a valid
 * license.
 */
const LicenseRequired = ({ children, as = "", ...rest }: LicenseRequiredProps) => {
  const session = useSession();
  const { t } = useLocale();
  const Component = as || Fragment;
  const hasValidLicense = session.data ? session.data.hasValidLicense : null;
  return (
    <Component {...rest}>
      {hasValidLicense === null || hasValidLicense ? (
        children
      ) : (
        <EmptyScreen
          Icon={Icon.FiAlertTriangle}
          headline={t("enterprise_license")}
          description={
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  t("enterprise_license_description", {
                    consoleUrl: `<a href="${CONSOLE_URL}" target="_blank" rel="noopener noreferrer" class="underline">
                Cal.com console
              </a>`,
                    supportMail: `<a href="mailto:peer@cal.com" class="underline">
                peer@cal.com
              </a>`,
                  })
                ),
              }}
            />
          }
        />
      )}
    </Component>
  );
};

export const withLicenseRequired =
  <T,>(Component: ComponentType<T>) =>
  // eslint-disable-next-line react/display-name
  (hocProps: T) =>
    (
      <LicenseRequired>
        <Component {...hocProps} />
      </LicenseRequired>
    );

export default LicenseRequired;
