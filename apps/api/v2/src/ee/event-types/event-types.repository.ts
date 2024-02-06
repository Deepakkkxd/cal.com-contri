import { CreateEventTypeInput } from "@/ee/event-types/inputs/create-event-type.input";
import { PrismaReadService } from "@/modules/prisma/prisma-read.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";

import { getEventTypeById } from "@calcom/platform-libraries";

@Injectable()
export class EventTypesRepository {
  constructor(private readonly dbRead: PrismaReadService, private readonly dbWrite: PrismaReadService) {}

  async createUserEventType(userId: number, body: CreateEventTypeInput) {
    return this.dbWrite.prisma.eventType.create({
      data: {
        ...body,
        userId,
        users: { connect: { id: userId } },
      },
    });
  }

  async getUserEventType(userId: number, eventTypeId: number) {
    return this.dbRead.prisma.eventType.findFirst({
      where: {
        id: eventTypeId,
        userId,
      },
    });
  }

  async getUserEventTypeForAtom(user: User, isUserOrganizationAdmin: boolean, eventTypeId: number) {
    try {
      return getEventTypeById({
        currentOrganizationId: user.organizationId,
        eventTypeId,
        userId: user.id,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        prisma: this.dbRead.prisma,
        isUserOrganizationAdmin,
      });
    } catch (error) {
      throw new NotFoundException(`User with id ${user.id} has no event type with id ${eventTypeId}`);
    }
  }
}
