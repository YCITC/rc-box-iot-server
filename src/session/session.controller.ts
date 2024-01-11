import * as console from 'console';

import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Res } from '@nestjs/common';
import { Req, Session } from '@nestjs/common';
import { Request, Response } from 'express';

import SessionService from './session.service';
import AverageActiveSession from './interface/session.interface';

@ApiTags('Session')
@Controller('session')
export default class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  /*
  @Post('test/setCookie')
  login(@Res({ passthrough: true }) res: Response): Promise<boolean> {
    res.cookie('rtk', '123456');
    return Promise.resolve(true);
  }

  @Post('test/setSession')
  async setSession(
    @Session() session: Record<string, any>,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('Put ===========');
    // ? 如果用了 @Res，那麼 session就不會自動

    // ? 用 res 去設定cookie 會造成原本 return Promise的寫法不能用，必須用 @Res({ passthrough: true })
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

  @Get('test/printSession')
  @ApiOperation({
    summary: 'Print current session info in the terminal.',
  })
  @ApiResponse({
    status: 200,
  })
  getSession(@Req() req: Request, @Session() session: Record<string, any>) {
    console.log('req.sessionID: ', req.sessionID);
    console.log('req.cookies: ', req.cookies);
    console.log(`expires in ${session.cookie.maxAge / 1000} `);
    // console.log('session cookie:', session.cookie);
    console.log('session: ', session);
    console.log('\n');
  }

  @Delete('test/deleteSession')
  @ApiOperation({
    summary: 'Remove current session.',
  })
  @ApiResponse({
    status: 200,
  })
  deleteSession(
    @Session() session: Record<string, any>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      } else {
        // Clear the session cookie on the client side
        res.clearCookie('test');
        res.clearCookie('tid');
        console.log('session destroied');
      }
    });
  }
  */

  @Get('todayActive')
  @ApiOperation({
    summary: 'Get the count of active sessions for today.',
  })
  @ApiResponse({
    status: 200,
  })
  @ApiParam({
    name: 'day',
    description: 'The day parameter',
    type: 'integer',
    format: 'int32', // Set the format here
    required: true,
  })
  async todayActive(): Promise<number> {
    return this.sessionService.todayActive();
  }

  @Get('averageActive/:day')
  @ApiOperation({ summary: 'Return the average for the specified days.' })
  @ApiResponse({
    status: 200,
    type: AverageActiveSession,
  })
  async averageActive(
    @Param('day', ParseIntPipe) day: number,
  ): Promise<AverageActiveSession> {
    return this.sessionService.averageActive(day);
  }

  @Get('saveActiveSessions')
  @ApiOperation({
    summary: 'Store the count of active sessions in the database.',
  })
  @ApiResponse({
    status: 200,
  })
  async saveActiveSessions(): Promise<boolean> {
    await this.sessionService.saveActiveSessions();
    return true;
  }
}
