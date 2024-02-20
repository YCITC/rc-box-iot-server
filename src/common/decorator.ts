import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import JwtAuthGuard from '../guards/jwt-auth.guard';
import RolesGuard from '../guards/roles.guard';
import RolesEnum from './enum';

const Auth = (...roles: RolesEnum[]) => {
  return applyDecorators(
    SetMetadata('ROLES', roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Unauthorized' }),
  );
};

// eslint-disable-next-line import/prefer-default-export
export { Auth };
