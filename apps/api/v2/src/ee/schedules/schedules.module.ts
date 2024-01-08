import { SchedulesController } from "@/ee/schedules/controllers/schedules.controller";
import { SchedulesRepository } from "@/ee/schedules/schedules.repository";
import { SchedulesService } from "@/ee/schedules/services/schedules.service";
import { AvailabilitiesModule } from "@/modules/availabilities/availabilities.module";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { UsersModule } from "@/modules/users/users.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule, AvailabilitiesModule, UsersModule],
  providers: [SchedulesRepository, SchedulesService],
  controllers: [SchedulesController],
})
export class SchedulesModule {}
