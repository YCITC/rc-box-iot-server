import { Controller, Get, Post, Req, Param, Body } from '@nestjs/common';
import { Request } from 'express';
import { PushService } from './push.service';
import { PushRegisterDto } from './dto/pushRegister.dto';
import { PushClient } from './interface/push.client.entity';
import { iOSClient } from './interface/ios.client.entity';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Get('genVAPID/:browserName')
  genVapid(@Param() params) {
    return this.pushService.genVapid(params.browserName);
  }

  @Post('subscribe')
  subscribe(@Body() pushRegisterDto: PushRegisterDto): Promise<PushClient> {
    return this.pushService.broswerSubscribe(pushRegisterDto);
  }

  @Post('subscribeIOS')
  subscribeIOS(@Body() pushRegisterDto: PushRegisterDto): Promise<iOSClient> {
    console.log('recived dto: \n', pushRegisterDto);
    return this.pushService.iOSSubscribe(pushRegisterDto);
  }

  @Post('send')
  send(@Req() req: Request): boolean {
    // console.log('request: ', req);
    // console.log('headers: ', req.headers);
    // console.log('body: ', req.body.deviceId);
    // console.log('query: ', req.query);
    this.pushService.sendWeb(req.body.deviceId);
    this.pushService.sendiPhone(req.body.deviceId);
    return true;
  }
}
