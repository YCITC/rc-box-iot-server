import { Injectable, NestMiddleware } from '@nestjs/common';
import { Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import SessionService from './session.service';

@Injectable()
export default class SessionMiddleware implements NestMiddleware {
  constructor(private sessionService: SessionService) {}

  use(@Req() req: Request, @Res() res: Response, next: () => void) {
    const session = req.session as Record<string, any>;
    if (!session.sessionRecorded) {
      session.sessionRecorded = true;
      const sessionId = req.sessionID;
      this.sessionService.addSession(sessionId);
    }
    next();
  }
}
