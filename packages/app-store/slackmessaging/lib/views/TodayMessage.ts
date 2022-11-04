import { Booking } from "@prisma/client";
import { Blocks, Elements, Message } from "slack-block-builder";

import dayjs from "@calcom/dayjs";
import { WEBAPP_URL } from "@calcom/lib/constants";

const TodayMessage = (bookings: Booking[]) => {
  if (bookings.length === 0) {
    return Message()
      .blocks(Blocks.Section({ text: "You do not have any bookings for today." }))
      .asUser()
      .buildToObject();
  }
  return Message()
    .blocks(
      Blocks.Section({ text: `Todays Bookings.` }),
      Blocks.Divider(),
      bookings.map((booking) =>
        Blocks.Section({
          text: `${booking.title} | ${dayjs(booking.startTime).format("HH:mm")}`,
        }).accessory(
          Elements.Button({ text: "Cancel", url: `${WEBAPP_URL}/success?uid=${booking.uid}&cancel=true` })
        )
      )
    )
    .buildToObject();
};

export default TodayMessage;
