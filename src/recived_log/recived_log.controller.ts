import { Controller, Get, Post, Req } from '@nestjs/common';
import { ReceivedLogService } from './recived_log.service';
import { Request } from 'express';

@Controller('log')
export class ReceivedLogController {
  constructor(private readonly receiveService: ReceivedLogService) {}

  @Get('all')
  getHello(): string {
    // return this.receiveService.findAll();
    return 'Log All';
  }

  @Post('add')
  add(@Req() req: Request): boolean {
    // console.log('request: ', req);
    console.log('headers: ', req.headers);
    console.log('body: ', req.body);
    console.log('query: ', req.query);
    return true;
  }
}
