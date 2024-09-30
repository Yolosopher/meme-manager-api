import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { AuthResult } from 'src/users/dto/user.dto';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const authorization = request.headers.authorization;

      const token = authorization.split(' ')[1];

      if (!token) {
        throw new Error();
      }
      const tokenPayload = await this.jwtService.verifyAsync(token);
      const authResult = {
        id: tokenPayload.id,
        email: tokenPayload.email,
        role: tokenPayload.role,
      };

      request.user = authResult as AuthResult;
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException();
    }
  }
}
