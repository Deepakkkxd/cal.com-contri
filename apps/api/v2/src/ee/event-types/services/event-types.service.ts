import { DEFAULT_EVENT_TYPES } from "@/ee/event-types/constants/constants";
import { EventTypesRepository } from "@/ee/event-types/event-types.repository";
import { CreateEventTypeInput } from "@/ee/event-types/inputs/create-event-type.input";
import { MembershipsRepository } from "@/modules/memberships/memberships.repository";
import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";

@Injectable()
export class EventTypesService {
  constructor(
    private readonly eventTypesRepository: EventTypesRepository,
    private readonly membershipsRepository: MembershipsRepository
  ) {}

  async createUserEventType(userId: number, body: CreateEventTypeInput) {
    return this.eventTypesRepository.createUserEventType(userId, body);
  }

  async getUserEventType(userId: number, eventTypeId: number) {
    return this.eventTypesRepository.getUserEventType(userId, eventTypeId);
  }

  async getUserEventTypeForAtom(user: User, eventTypeId: number) {
    const isUserOrganizationAdmin = user?.organizationId
      ? await this.membershipsRepository.isUserOrganizationAdmin(user.id, user.organizationId)
      : false;

    return this.eventTypesRepository.getUserEventTypeForAtom(user.id, isUserOrganizationAdmin, eventTypeId);
  }

  async createUserDefaultEventTypes(userId: number) {
    const thirtyMinutes = DEFAULT_EVENT_TYPES.thirtyMinutes;
    const sixtyMinutes = DEFAULT_EVENT_TYPES.sixtyMinutes;

    const defaultEventTypes = await Promise.all([
      this.eventTypesRepository.createUserEventType(userId, thirtyMinutes),
      this.eventTypesRepository.createUserEventType(userId, sixtyMinutes),
    ]);

    return defaultEventTypes;
  }
}
