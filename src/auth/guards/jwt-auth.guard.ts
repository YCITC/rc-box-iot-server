import * as console from 'console';

import { ExecutionContext, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export default class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    // console.log('JwtAuthGuard-handleRequest: user', user);
    if (!user) {
      throw new UnauthorizedException('Need token');
    }
    if (err) {
      console.log('JwtAuthGuard-handleRequest: info', info);
      throw err;
    }
    return user;
  }
}
