import { ExecutionContext, Injectable } from '@nestjs/common';

import { AuthGuard } from './auth.guard';

@Injectable()
export class AdminGuard extends AuthGuard {
  async canActivate(context: ExecutionContext) {
    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      return false;
    }
    const request = context.switchToHttp().getRequest();
    return request.user.role === 'ADMIN';
  }
}
