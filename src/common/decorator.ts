import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiServiceUnavailableResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import JwtAuthGuard from './guards/jwt-auth.guard';
import RolesGuard from './guards/roles.guard';
import RolesEnum from './enum';
import DisableGuard from './guards/disable.guard';

const Auth = (...roles: RolesEnum[]) => {
  return applyDecorators(
    SetMetadata('ROLES', roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Have no permission' }),
  );
};

const DisableRoute = () => {
  return applyDecorators(
    UseGuards(DisableGuard),
    ApiServiceUnavailableResponse({ description: 'This API is disabled' }),
    ApiExcludeEndpoint(),
  );
};

export { Auth, DisableRoute };
