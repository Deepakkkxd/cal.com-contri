import { CalendarSearch } from "lucide-react";

import { APP_NAME } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button, Dialog, DialogContent, DialogFooter } from "@calcom/ui";

interface IOverlayCalendarContinueModalProps {
  open?: boolean;
  onClose?: (state: boolean) => void;
  onContinue: (provider: "calcom" | "google-for-overlay") => void;
}

export function OverlayCalendarContinueModal(props: IOverlayCalendarContinueModalProps) {
  const { t } = useLocale();
  return (
    <>
      <Dialog open={props.open} onOpenChange={props.onClose}>
        <DialogContent
          type="creation"
          title={t("overlay_my_calendar")}
          description={t("overlay_my_calendar_toc")}>
          <div className="flex flex-col gap-2">
            <Button
              data-testid="overlay-calendar-continue-button"
              onClick={() => {
                props.onContinue("calcom");
              }}
              className="gap w-full items-center justify-center font-semibold"
              StartIcon={CalendarSearch}>
              {t("continue_with", { appName: APP_NAME })}
            </Button>
            <Button
              color="secondary"
              data-testid="overlay-calendar-google-button"
              onClick={() => {
                props.onContinue("google-for-overlay");
              }}
              className="gap w-full items-center justify-center font-semibold"
              StartIcon={() => (
                <>
                  <img
                    className="text-subtle  mr-2 h-4 w-4 opacity-50 dark:invert"
                    src="/google-icon.svg"
                    alt=""
                  />
                </>
              )}>
              {t("continue_with", { appName: "Google" })}
            </Button>
          </div>
          <DialogFooter>
            {/* Agh modal hacks */}
            <></>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
