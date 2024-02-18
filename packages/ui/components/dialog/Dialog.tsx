import * as DialogPrimitive from "@radix-ui/react-dialog";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import React, { useState } from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import classNames from "@calcom/lib/classNames";
import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import useMediaQuery from "@calcom/lib/hooks/useMediaQuery";
import type { SVGComponent } from "@calcom/types/SVGComponent";

import type { ButtonProps } from "../../components/button";
import { Button } from "../../components/button";

export type DialogProps = React.ComponentProps<(typeof DialogPrimitive)["Root"]> & {
  name?: string;
  clearQueryParamsOnClose?: string[];
};

const enum DIALOG_STATE {
  // Dialog is there in the DOM but not visible.
  CLOSED = "CLOSED",
  // State from the time b/w the Dialog is dismissed and the time the "dialog" query param is removed from the URL.
  CLOSING = "CLOSING",
  // Dialog is visible.
  OPEN = "OPEN",
}

export function Dialog(props: DialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useCompatSearchParams();
  const newSearchParams = new URLSearchParams(searchParams ?? undefined);
  const { children, name, ...dialogProps } = props;
  const isMobile = useMediaQuery("(max-width: 768px)");

  // only used if name is set
  const [dialogState, setDialogState] = useState(dialogProps.open ? DIALOG_STATE.OPEN : DIALOG_STATE.CLOSED);
  const shouldOpenDialog = newSearchParams.get("dialog") === name;
  if (name) {
    const clearQueryParamsOnClose = ["dialog", ...(props.clearQueryParamsOnClose || [])];
    dialogProps.onOpenChange = (open) => {
      if (props.onOpenChange) {
        props.onOpenChange(open);
      }

      // toggles "dialog" query param
      if (open) {
        newSearchParams.set("dialog", name);
      } else {
        clearQueryParamsOnClose.forEach((queryParam) => {
          newSearchParams.delete(queryParam);
        });
        router.push(`${pathname}?${newSearchParams.toString()}`);
      }
      setDialogState(open ? DIALOG_STATE.OPEN : DIALOG_STATE.CLOSING);
    };

    if (dialogState === DIALOG_STATE.CLOSED && shouldOpenDialog) {
      setDialogState(DIALOG_STATE.OPEN);
    }

    if (dialogState === DIALOG_STATE.CLOSING && !shouldOpenDialog) {
      setDialogState(DIALOG_STATE.CLOSED);
    }

    // allow overriding
    if (!("open" in dialogProps)) {
      dialogProps.open = dialogState === DIALOG_STATE.OPEN ? true : false;
    }
  }

  if (isMobile) return <DrawerPrimitive.Root {...dialogProps}>{children}</DrawerPrimitive.Root>;
  return <DialogPrimitive.Root {...dialogProps}>{children}</DialogPrimitive.Root>;
}

function DialogPortalWrapper({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  if (isMobile)
    return (
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay className="fadeIn fixed inset-0 z-50 bg-neutral-800 bg-opacity-70 transition-opacity dark:bg-opacity-70 " />
        {children}
      </DrawerPrimitive.Portal>
    );
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fadeIn fixed inset-0 z-50 bg-neutral-800 bg-opacity-70 transition-opacity dark:bg-opacity-70 " />
      {children}
    </DialogPrimitive.Portal>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DialogContentWrapper({ children, ...props }: any) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { enableOverflow, forwardedRef, ...rest } = props;
  if (isMobile) {
    return (
      <DrawerPrimitive.Content
        {...rest}
        className={classNames(
          "fadeIn bg-default scroll-bar fixed inset-x-0 bottom-0 z-50 w-full rounded-md text-left shadow-xl after:!sticky focus-visible:outline-none sm:align-middle",
          props.size == "xl"
            ? "px-8 pt-8"
            : props.size == "lg"
            ? "px-8 pt-8"
            : props.size == "md"
            ? "px-8 pt-8"
            : "px-8 pt-8",
          "max-h-[95vh]",
          enableOverflow ? "overflow-auto" : "overflow-visible",
          `${props.className || ""}`
        )}
        ref={forwardedRef}>
        <div className="bg-muted mx-auto mt-4 h-2 w-[100px] rounded-full" />
        {children}
      </DrawerPrimitive.Content>
    );
  }
  return (
    <DialogPrimitive.Content
      {...rest}
      className={classNames(
        "fadeIn bg-default scroll-bar fixed left-1/2 top-1/2 z-50 w-full max-w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-md text-left shadow-xl focus-visible:outline-none sm:align-middle",
        props.size == "xl"
          ? "px-8 pt-8 sm:max-w-[90rem]"
          : props.size == "lg"
          ? "px-8 pt-8 sm:max-w-[70rem]"
          : props.size == "md"
          ? "px-8 pt-8 sm:max-w-[48rem]"
          : "px-8 pt-8 sm:max-w-[35rem]",
        "max-h-[95vh]",
        enableOverflow ? "overflow-auto" : "overflow-visible",
        `${props.className || ""}`
      )}
      ref={forwardedRef}>
      {children}
    </DialogPrimitive.Content>
  );
}

type DialogContentProps = React.ComponentProps<(typeof DialogPrimitive)["Content"]> & {
  size?: "xl" | "lg" | "md";
  type?: "creation" | "confirmation";
  title?: string;
  description?: string | JSX.Element | null;
  closeText?: string;
  actionDisabled?: boolean;
  Icon?: SVGComponent;
  enableOverflow?: boolean;
};

// enableOverflow:- use this prop whenever content inside DialogContent could overflow and require scrollbar
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, title, Icon, enableOverflow, type = "creation", ...props }, forwardedRef) => {
    return (
      <DialogPortalWrapper>
        <DialogContentWrapper {...props} enableOverflow={enableOverflow} forwardedRef={forwardedRef}>
          {type === "creation" && (
            <div>
              <DialogHeader title={title} subtitle={props.description} />
              <div data-testid="dialog-creation" className="flex flex-col">
                {children}
              </div>
            </div>
          )}
          {type === "confirmation" && (
            <div className="flex">
              {Icon && (
                <div className="bg-emphasis mr-4 inline-flex h-10 w-10 items-center justify-center rounded-full">
                  <Icon className="text-emphasis h-4 w-4" />
                </div>
              )}
              <div className="w-full">
                <DialogHeader title={title} subtitle={props.description} />
                <div data-testid="dialog-confirmation">{children}</div>
              </div>
            </div>
          )}
          {!type && children}
        </DialogContentWrapper>
      </DialogPortalWrapper>
    );
  }
);

type DialogHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
};

export function DialogHeader(props: DialogHeaderProps) {
  if (!props.title) return null;

  return (
    <div className="mb-4">
      <h3
        data-testid="dialog-title"
        className="leading-20 text-semibold font-cal text-emphasis pb-1 text-xl"
        id="modal-title">
        {props.title}
      </h3>
      {props.subtitle && <div className="text-subtle text-sm">{props.subtitle}</div>}
    </div>
  );
}

export function DialogFooter(props: { children: ReactNode; className?: string; showDivider?: boolean }) {
  return (
    <div className={classNames("bg-default sticky bottom-0", props.className)}>
      {props.showDivider && (
        // TODO: the -mx-8 is causing overflow in the dialog buttons
        <hr data-testid="divider" className="border-subtle -mx-8" />
      )}
      <div
        className={classNames(
          "flex justify-end space-x-2 pb-2 pt-2 rtl:space-x-reverse md:pb-4 md:pt-4",
          !props.showDivider && "pb-6 md:pb-8"
        )}>
        {props.children}
      </div>
    </div>
  );
}

DialogContent.displayName = "DialogContent";

export const DialogTrigger = DialogPrimitive.Trigger;
// export const DialogClose = DialogPrimitive.Close;

function DialogCloseWrapper(props: {
  children: ReactNode;
  dialogCloseProps?: React.ComponentProps<(typeof DialogPrimitive)["Close"]>;
}) {
  const { children, ...rest } = props;
  const isMobile = useMediaQuery("(max-width: 768px)");
  if (isMobile)
    return (
      <DrawerPrimitive.Close asChild {...rest}>
        {children}
      </DrawerPrimitive.Close>
    );
  return (
    <DialogPrimitive.Close asChild {...rest}>
      {children}
    </DialogPrimitive.Close>
  );
}

export function DialogClose(
  props: {
    "data-testid"?: string;
    dialogCloseProps?: React.ComponentProps<(typeof DialogPrimitive)["Close"]>;
    children?: ReactNode;
    onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    disabled?: boolean;
    color?: ButtonProps["color"];
  } & React.ComponentProps<typeof Button>
) {
  const { t } = useLocale();
  return (
    <DialogCloseWrapper {...props.dialogCloseProps}>
      {/* This will require the i18n string passed in */}
      <Button
        data-testid={props["data-testid"] || "dialog-rejection"}
        color={props.color || "minimal"}
        {...props}>
        {props.children ? props.children : t("Close")}
      </Button>
    </DialogCloseWrapper>
  );
}
