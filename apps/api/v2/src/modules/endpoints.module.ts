import { PlatformEndpointsModule } from "@/ee/platform-endpoints-module";
import { BookingModule } from "@/modules/bookings/booking.module";
import { OAuthClientModule } from "@/modules/oauth-clients/oauth-client.module";
import type { MiddlewareConsumer, NestModule } from "@nestjs/common";
import { Module } from "@nestjs/common";

@Module({
  imports: [BookingModule, OAuthClientModule, PlatformEndpointsModule],
})
export class EndpointsModule implements NestModule {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  configure(_consumer: MiddlewareConsumer) {
    // TODO: apply ratelimits
  }
}
