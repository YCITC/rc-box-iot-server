import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export default class GoogleOauthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext) {
    const activate = (await super.canActivate(context)) as boolean;
    /*
    * express session login
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    */

    return activate;
  }
}
