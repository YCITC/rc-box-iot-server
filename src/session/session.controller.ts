import * as console from 'console';

import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Post, Res } from '@nestjs/common';
import { Req, Session } from '@nestjs/common';
import { Request, Response } from 'express';

import SessionService from './session.service';

@ApiTags('Session')
@Controller('session')
export default class SessionController {
  constructor(
    private readonly sessionService: SessionService
  ) {}

  @Post('setCookie')
  login(@Res({ passthrough: true }) res: Response): Promise<boolean> {
    res.cookie('rtk', '123456');
    return Promise.resolve(true);
  }

  @Post()
  async setSession(
    @Session() session: Record<string, any>,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('Put ===========');
    // 如果用了 @Res，那麼 session就不會自動

    //! 用 res 去設定cookie 會造成原本 return Promise的寫法不能用，必須用 @Res({ passthrough: true })
    res.cookie('test', 'test', {
      maxAge: 5184000000,
      sameSite: true,
      httpOnly: true,
    });

    console.log('session:', session);
    console.log('req.sessionID: ', req.sessionID);
    console.log(`expires in ${req.session.cookie.maxAge / 1000}`);
    console.log('\n');
    return Promise.resolve(true);
  }

  @Get()
  getSession(@Req() req: Request, @Session() session: Record<string, any>) {
    console.log('req.sessionID: ', req.sessionID);
    console.log('req.cookies: ', req.cookies);
    console.log(`expires in ${session.cookie.maxAge / 1000} `);
    // console.log('session cookie:', session.cookie);
    console.log('session: ', session);

    console.log('\n');
  }

  @Delete()
  deleteSession(
    @Session() session: Record<string, any>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    session.destroy((err) => {
      console.warn('cannot access session here');
      if (err) {
        console.error('Error destroying session:', err);
      } else {
        // Clear the session cookie on the client side
        res.clearCookie('test');
        res.clearCookie('tid');
        console.log('session destroied');

        // // Write response
        // res.end();
      }
    });
    // console.log('sessionID: ', req.sessionID);
    // console.log('cookies: ', req.cookies);
    // console.log(`expires in ${session.cookie.maxAge / 1000} `);
  }

  @Get('count')
  countSessions(): Promise<number> {
    return this.sessionService.countSessions();
  }

  @Get('saveActiveSessions')
  async saveActiveSessions(): Promise<boolean> {
    await this.sessionService.saveActiveSessions();
    return true;
  }
}
