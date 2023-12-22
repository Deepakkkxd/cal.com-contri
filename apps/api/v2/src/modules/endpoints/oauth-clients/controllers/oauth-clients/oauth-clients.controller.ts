import { GetUser } from "@/modules/auth/decorators";
import { Roles } from "@/modules/auth/decorators/roles/roles.decorator";
import { NextAuthGuard } from "@/modules/auth/guards";
import { OrganizationRolesGuard } from "@/modules/auth/guards/organization-roles/organization-roles.guard";
import { UpdateOAuthClientInput } from "@/modules/endpoints/oauth-clients/inputs/update-oauth-client.input";
import { OAuthClientRepository } from "@/modules/endpoints/oauth-clients/oauth-client.repository";
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { MembershipRole, PlatformOAuthClient } from "@prisma/client";

import { SUCCESS_STATUS } from "@calcom/platform-constants";
import { CreateOAuthClientInput } from "@calcom/platform-types";
import type { ApiResponse } from "@calcom/platform-types";

@Controller({
  path: "oauth-clients",
  version: "2",
})
@UseGuards(NextAuthGuard, OrganizationRolesGuard)
export class OAuthClientsController {
  private readonly logger = new Logger("OAuthClientController");

  constructor(private readonly oauthClientRepository: OAuthClientRepository) {}

  @Post("/")
  @HttpCode(HttpStatus.CREATED)
  @Roles([MembershipRole.ADMIN, MembershipRole.OWNER])
  async createOAuthClient(
    @GetUser("organizationId") organizationId: number,
    @Body() body: CreateOAuthClientInput
  ): Promise<ApiResponse<{ clientId: string; clientSecret: string }>> {
    this.logger.log(
      `For organisation ${organizationId} creating OAuth Client with data: ${JSON.stringify(body)}`
    );
    const { id, secret } = await this.oauthClientRepository.createOAuthClient(organizationId, body);
    return {
      status: SUCCESS_STATUS,
      data: {
        clientId: id,
        clientSecret: secret,
      },
    };
  }

  @Get("/")
  @HttpCode(HttpStatus.OK)
  @Roles([MembershipRole.ADMIN, MembershipRole.OWNER, MembershipRole.MEMBER])
  async getOAuthClients(
    @GetUser("organizationId") organizationId: number
  ): Promise<ApiResponse<PlatformOAuthClient[]>> {
    const clients = await this.oauthClientRepository.getOrganizationOAuthClients(organizationId);
    return { status: SUCCESS_STATUS, data: clients };
  }

  @Get("/:clientId")
  @HttpCode(HttpStatus.OK)
  @Roles([MembershipRole.ADMIN, MembershipRole.OWNER, MembershipRole.MEMBER])
  async getOAuthClientById(@Param("clientId") clientId: string): Promise<ApiResponse<PlatformOAuthClient>> {
    const client = await this.oauthClientRepository.getOAuthClient(clientId);
    if (!client) {
      throw new NotFoundException(`OAuth client with ID ${clientId} not found`);
    }
    return { status: SUCCESS_STATUS, data: client };
  }

  @Put("/:clientId")
  @HttpCode(HttpStatus.OK)
  @Roles([MembershipRole.ADMIN, MembershipRole.OWNER])
  async updateOAuthClient(
    @Param("clientId") clientId: string,
    @Body() body: UpdateOAuthClientInput
  ): Promise<ApiResponse<PlatformOAuthClient>> {
    this.logger.log(`For client ${clientId} updating OAuth Client with data: ${JSON.stringify(body)}`);
    const client = await this.oauthClientRepository.updateOAuthClient(clientId, body);
    return { status: SUCCESS_STATUS, data: client };
  }

  @Delete("/:clientId")
  @HttpCode(HttpStatus.OK)
  @Roles([MembershipRole.ADMIN, MembershipRole.OWNER])
  async deleteOAuthClient(@Param("clientId") clientId: string): Promise<ApiResponse<PlatformOAuthClient>> {
    this.logger.log(`Deleting OAuth Client with ID: ${clientId}`);
    const client = await this.oauthClientRepository.deleteOAuthClient(clientId);
    return { status: SUCCESS_STATUS, data: client };
  }
}
