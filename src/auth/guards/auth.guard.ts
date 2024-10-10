import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Token } from '@prisma/client';
import { TokenService } from 'src/token/token.service';
import { AuthResult } from 'src/users/dto/user.dto';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private tokenService: TokenService,
  ) {}
  async canActivate(context: ExecutionContext) {
    let foundInDB: null | Token = null;
    const contextType: 'ws' | 'http' = context.getType();
    const exceptions = {
      http: {
        empty: new UnauthorizedException(),
        expired: new UnauthorizedException('Token expired'),
      },
      ws: {
        empty: new WsException('Unauthorized'),
        expired: new WsException('Token expired'),
      },
    };
    try {
      let token: string;
      let request: any;
      if (contextType === 'ws') {
        // for sockets
        token = context.switchToWs().getData().token;
      } else {
        // for http
        request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization;
        token = authorization.split(' ')[1];
      }

      if (!token) {
        throw exceptions[contextType].empty;
      }

      // check if token is in the database
      foundInDB = await this.tokenService.findToken(token);
      if (!foundInDB) {
        throw exceptions[contextType].empty;
      }

      // check if token is valid
      const tokenPayload = await this.jwtService.verifyAsync(token.trim());

      const authResult = {
        id: tokenPayload.id,
        email: tokenPayload.email,
        role: tokenPayload.role,
        name: tokenPayload.name,
      };

      if (contextType === 'ws') {
        const wsRequest = context.switchToWs().getData();
        wsRequest.user = authResult as AuthResult;
      } else {
        request.user = authResult as AuthResult;
        request.token = token;
      }

      return true;
    } catch (error) {
      if (foundInDB) {
        await this.tokenService.deleteToken(foundInDB.token);
      }
      if (error instanceof TokenExpiredError) {
        throw exceptions[contextType].expired;
      }
      throw exceptions[context.getType()].empty;
    }
  }
}
