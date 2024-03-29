import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export default class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'ROLES',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const { user } = request;
    if (requiredRoles.includes(user.role)) {
      return true;
    }
    throw new ForbiddenException();
  }
}
