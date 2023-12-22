import { OAuthFlowService } from "@/modules/oauth-clients/services/oauth-flow.service";
import { TokensRepository } from "@/modules/tokens/tokens.repository";
import { UsersRepository } from "@/modules/users/users.repository";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";

class BaseStrategy {
  success!: (user: unknown) => void;
  error!: (error: Error) => void;
}

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(BaseStrategy, "access-token") {
  constructor(
    private readonly oauthFlowService: OAuthFlowService,
    private readonly tokensRepository: TokensRepository,
    private readonly userRepository: UsersRepository
  ) {
    super();
  }

  async authenticate(request: Request) {
    try {
      const accessToken = request.get("Authorization")?.replace("Bearer ", "");

      if (!accessToken) {
        throw new UnauthorizedException("Access token is missing or invalid.");
      }

      const valid = this.oauthFlowService.validateAccessToken(accessToken);

      if (!valid) {
        throw new UnauthorizedException("Access token is missing or invalid.");
      }

      const ownerId = await this.tokensRepository.getAccessTokenOwnerId(accessToken);

      if (!ownerId) {
        throw new UnauthorizedException("Invalid access token");
      }

      const user = await this.userRepository.findById(ownerId);

      if (!user) {
        throw new UnauthorizedException("User associated with the access token not found.");
      }

      return this.success(user);
    } catch (error) {
      if (error instanceof Error) return this.error(error);
    }
  }
}
