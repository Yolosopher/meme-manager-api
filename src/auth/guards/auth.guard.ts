import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
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
    try {
      const request = context.switchToHttp().getRequest();
      const authorization = request.headers.authorization;

      const token = authorization.split(' ')[1];

      if (!token) {
        throw new Error();
      }

      // check if token is in the database
      foundInDB = await this.tokenService.findToken(token);
      if (!foundInDB) {
        throw new UnauthorizedException();
      }

      // check if token is valid
      const tokenPayload = await this.jwtService.verifyAsync(token);
      const authResult = {
        id: tokenPayload.id,
        email: tokenPayload.email,
        role: tokenPayload.role,
        name: tokenPayload.name,
      };

      request.user = authResult as AuthResult;
      request.token = token;
      return true;
    } catch (error) {
      if (foundInDB) {
        await this.tokenService.deleteToken(foundInDB.token);
      }
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException();
    }
  }
}
