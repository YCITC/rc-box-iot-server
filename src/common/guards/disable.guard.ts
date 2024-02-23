import {
  Injectable,
  CanActivate,
  ServiceUnavailableException,
} from '@nestjs/common';

@Injectable()
export default class DisableGuard implements CanActivate {
  canActivate(): boolean {
    throw new ServiceUnavailableException('This API is disabled');
  }
}
