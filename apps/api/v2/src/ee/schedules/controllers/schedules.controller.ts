import { ResponseService } from "@/ee/schedules/services/response/response.service";
import { SchedulesService } from "@/ee/schedules/services/schedules.service";
import { GetUser } from "@/modules/auth/decorators/get-user/get-user.decorator";
import { Permissions } from "@/modules/auth/decorators/permissions/permissions.decorator";
import { AccessTokenGuard } from "@/modules/auth/guards/access-token/access-token.guard";
import { PermissionsGuard } from "@/modules/auth/guards/permissions/permissions.guard";
import { UserWithProfile } from "@/modules/users/users.repository";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { ApiTags as DocsTags } from "@nestjs/swagger";

import { SCHEDULE_READ, SCHEDULE_WRITE, SUCCESS_STATUS } from "@calcom/platform-constants";
import type { ScheduleWithAvailabilitiesForWeb } from "@calcom/platform-libraries";
import { updateScheduleHandler } from "@calcom/platform-libraries";
import type { UpdateScheduleOutputType } from "@calcom/platform-libraries";
import { ApiSuccessResponse, UpdateScheduleInput } from "@calcom/platform-types";
import { ApiResponse } from "@calcom/platform-types";

import { CreateScheduleInput } from "../inputs/create-schedule.input";

@Controller({
  path: "schedules",
  version: "2",
})
@UseGuards(AccessTokenGuard, PermissionsGuard)
@DocsTags("Schedules")
export class SchedulesController {
  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly schedulesResponseService: ResponseService
  ) {}

  @Post("/")
  @Permissions([SCHEDULE_WRITE])
  async createSchedule(
    @GetUser() user: UserWithProfile,
    @Body() bodySchedule: CreateScheduleInput
  ): Promise<ApiSuccessResponse<ScheduleWithAvailabilitiesForWeb>> {
    const schedule = await this.schedulesService.createUserSchedule(user.id, bodySchedule);
    const scheduleFormatted = await this.schedulesResponseService.formatScheduleForAtom(user, schedule);

    return {
      status: SUCCESS_STATUS,
      data: scheduleFormatted,
    };
  }

  @Get("/default")
  @Permissions([SCHEDULE_READ])
  async getDefaultSchedule(
    @GetUser() user: UserWithProfile
  ): Promise<ApiResponse<ScheduleWithAvailabilitiesForWeb | null>> {
    const schedule = await this.schedulesService.getUserScheduleDefault(user.id);
    const scheduleFormatted = schedule
      ? await this.schedulesResponseService.formatScheduleForAtom(user, schedule)
      : null;

    return {
      status: SUCCESS_STATUS,
      data: scheduleFormatted,
    };
  }

  @Get("/:scheduleId")
  @Permissions([SCHEDULE_READ])
  async getSchedule(
    @GetUser() user: UserWithProfile,
    @Param("scheduleId") scheduleId: number
  ): Promise<ApiSuccessResponse<ScheduleWithAvailabilitiesForWeb>> {
    const schedule = await this.schedulesService.getUserSchedule(user.id, scheduleId);
    const scheduleFormatted = await this.schedulesResponseService.formatScheduleForAtom(user, schedule);

    return {
      status: SUCCESS_STATUS,
      data: scheduleFormatted,
    };
  }

  @Get("/")
  @Permissions([SCHEDULE_READ])
  async getSchedules(
    @GetUser() user: UserWithProfile
  ): Promise<ApiSuccessResponse<ScheduleWithAvailabilitiesForWeb[]>> {
    const schedules = await this.schedulesService.getUserSchedules(user.id);
    const schedulesFormatted = await this.schedulesResponseService.formatSchedulesForAtom(user, schedules);

    return {
      status: SUCCESS_STATUS,
      data: schedulesFormatted,
    };
  }

  // note(Lauris): currently this endpoint is atoms only
  @Patch("/:scheduleId")
  @Permissions([SCHEDULE_WRITE])
  async updateSchedule(
    @GetUser() user: UserWithProfile,
    @Body() bodySchedule: UpdateScheduleInput
  ): Promise<ApiSuccessResponse<UpdateScheduleOutputType>> {
    const updatedSchedule: UpdateScheduleOutputType = await updateScheduleHandler({
      input: bodySchedule,
      ctx: { user },
    });

    return {
      status: SUCCESS_STATUS,
      data: updatedSchedule,
    };
  }

  @Delete("/:scheduleId")
  @HttpCode(HttpStatus.OK)
  @Permissions([SCHEDULE_WRITE])
  async deleteSchedule(
    @GetUser("id") userId: number,
    @Param("scheduleId") scheduleId: number
  ): Promise<ApiResponse> {
    await this.schedulesService.deleteUserSchedule(userId, scheduleId);

    return {
      status: SUCCESS_STATUS,
    };
  }
}
