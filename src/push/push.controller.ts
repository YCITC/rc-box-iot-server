import { Controller, Get, Post, Req, Body } from '@nestjs/common';
import { Request } from 'express';
import { PushService } from './push.service';
import { PushKeysDto } from './dto/pushKeys.dto';
import { PushClient } from './interface/push.client.entity';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Get('genVAPID')
  genVapid() {
    return this.pushService.genVapid();
  }

  @Post('subscribe')
  subscribe(@Body() pushKeysDto: PushKeysDto): Promise<PushClient> {
    return this.pushService.subscribe(pushKeysDto);
  }

  @Post('send')
  send(@Req() req: Request): string {
    // console.log('request: ', req);
    console.log('headers: ', req.headers);
    console.log('body: ', req.body.deviceId);
    console.log('query: ', req.query);
    this.pushService.send(req.body.deviceId);
    return 'This is test';
  }
}
