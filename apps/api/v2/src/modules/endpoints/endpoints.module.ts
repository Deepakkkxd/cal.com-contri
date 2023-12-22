import { BookingModule } from "@/modules/endpoints/bookings/booking.module";
import { OAuthClientModule } from "@/modules/endpoints/oauth-clients/oauth-client.module";
import type { MiddlewareConsumer, NestModule } from "@nestjs/common";
import { Module } from "@nestjs/common";

@Module({
  imports: [BookingModule, OAuthClientModule],
})
export class EndpointsModule implements NestModule {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  configure(_consumer: MiddlewareConsumer) {
    // TODO: apply ratelimits
  }
}
