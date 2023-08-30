import type { AppCategories, Prisma } from "@prisma/client";

import appStore from "@calcom/app-store";
import { PaymentServiceEvent } from "@calcom/app-store/stripepayment/lib/PaymentServiceEvent";
import type { EventTypeAppsList } from "@calcom/app-store/utils";
import type { EventTypeModel } from "@calcom/prisma/zod";
import type { PaymentApp } from "@calcom/types/PaymentService";

const handlePayments = async (
  selectedEventType: Pick<Zod.infer<typeof EventTypeModel>, "metadata">,
  paymentAppCredentials: {
    key: Prisma.JsonValue;
    appId: EventTypeAppsList;
    app: {
      dirName: string;
      categories: AppCategories[];
    } | null;
  },
  booking: {
    user: { email: string | null; name: string | null; timeZone: string } | null;
    id: number;
    startTime?: { toISOString: () => string };
    uid: string;
  },
  bookerEmail: string
) => {
  const paymentApp = (await appStore[
    paymentAppCredentials?.app?.dirName as keyof typeof appStore
  ]()) as PaymentApp;
  if (!paymentApp?.lib?.PaymentService) {
    console.warn(`payment App service of type ${paymentApp} is not implemented`);
    return null;
  }
  const PaymentService = paymentApp.lib.PaymentService as any;
  console.log("ps");

  const paymentInstance = new PaymentServiceEvent(paymentAppCredentials);
  console.log(paymentInstance);
  const paymentOption = "ON_BOOKING";

  // if (paymentOption === "HOLD") {
  //   paymentData = await paymentInstance.collectCard(
  //     {
  //       amount: selectedEventType?.metadata?.apps?.[paymentAppCredentials.appId].price,
  //       currency: selectedEventType?.metadata?.apps?.[paymentAppCredentials.appId].currency,
  //     },
  //     booking.id,
  //     bookerEmail,
  //     paymentOption
  //   );
  // } else {
  const paymentData = await paymentInstance.create(
    {
      amount: 5467,
      currency: "inr",
    },
    booking.id,
    bookerEmail,
    paymentOption
  );

  if (!paymentData) {
    console.error("Payment data is null");
    throw new Error("Payment data is null");
  }
  // try {
  //   await paymentInstance.afterPayment(evt, booking, paymentData);
  // } catch (e) {
  //   console.error(e);
  // }
  return paymentData;
};

export { handlePayments };
