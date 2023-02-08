import { Controller, Get, Post, Req, Param, Body } from '@nestjs/common';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { Request } from 'express';

import { PushService } from './push.service';
import { PushRegisterDto } from './dto/pushRegister.dto';
import { WebClient } from './entity/web.client.entity';
import { iOSClient } from './entity/ios.client.entity';
import { PushClientInterface } from './interface/push.client.interface';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Get('genVAPID/:browserName')
  genVapid(@Param() params) {
    return this.pushService.genVapid(params.browserName);
  }

  @Post('subscribe')
  subscribe(@Body() pushRegisterDto: PushRegisterDto): Promise<WebClient> {
    const deviceId = pushRegisterDto.deviceId;
    if (deviceId == undefined || deviceId == '') {
      return Promise.reject(
        new BadRequestException("Have no deviceId, it's length must > 0"),
      );
    }
    const browserName = pushRegisterDto.browserName;
    if (browserName == undefined || browserName == '') {
      return Promise.reject(
        new BadRequestException("Have no browserName, it's length must > 0"),
      );
    }
    const browserVersion = pushRegisterDto.browserVersion;
    if (browserVersion == undefined || browserVersion == '') {
      return Promise.reject(
        new BadRequestException("Have no browserVersion, it's length must > 0"),
      );
    }
    const vapidPublicKey = pushRegisterDto.vapidPublicKey;
    if (vapidPublicKey == undefined || vapidPublicKey == '') {
      return Promise.reject(
        new BadRequestException("Have no vapidPublicKey, it's length must > 0"),
      );
    }
    const vapidPrivateKey = pushRegisterDto.vapidPrivateKey;
    if (vapidPrivateKey == undefined || vapidPrivateKey == '') {
      return Promise.reject(
        new BadRequestException(
          "Have no vapidPrivateKey, it's length must > 0",
        ),
      );
    }
    const endpoint = pushRegisterDto.endpoint;
    if (endpoint == undefined || endpoint == '') {
      return Promise.reject(
        new BadRequestException("Have no endpoint, it's length must > 0"),
      );
    }
    const keysAuth = pushRegisterDto.keysAuth;
    if (keysAuth == undefined || keysAuth == '') {
      return Promise.reject(
        new BadRequestException("Have no keysAuth, it's length must > 0"),
      );
    }
    const keysP256dh = pushRegisterDto.keysP256dh;
    if (keysP256dh == undefined || keysP256dh == '') {
      return Promise.reject(
        new BadRequestException("Have no keysP256dh, it's length must > 0"),
      );
    }
    return this.pushService.broswerSubscribe(pushRegisterDto);
  }

  @Post('subscribeIOS')
  subscribeIOS(@Body() pushRegisterDto: PushRegisterDto): Promise<iOSClient> {
    console.log('recived dto: \n', pushRegisterDto);
    const deviceId = pushRegisterDto.deviceId;
    if (deviceId == undefined || deviceId == '') {
      return Promise.reject(
        new BadRequestException("Have no deviceId, it's length must > 0"),
      );
    }
    const appId = pushRegisterDto.appId;
    if (appId == undefined || appId == '') {
      return Promise.reject(
        new BadRequestException("Have no deviceId, it's length must > 0"),
      );
    }
    const iPhoneToken = pushRegisterDto.iPhoneToken;
    if (iPhoneToken == undefined || iPhoneToken == '') {
      return Promise.reject(
        new BadRequestException("Have no iPhoneToken, it's length must > 0"),
      );
    }
    return this.pushService.iOSSubscribe(pushRegisterDto);
  }

  @Post('send')
  async send(@Req() req: Request): Promise<PushClientInterface[]> {
    // console.log('request: ', req);
    // console.log('headers: ', req.headers);
    // console.log('body: ', req.body.deviceId);
    // console.log('query: ', req.query);

    try {
      // return this.pushService.sendWeb(req.body.deviceId);
      const browserClientList = await this.pushService.sendWeb(
        req.body.deviceId,
      );
      const iPhoneClientList = await this.pushService.sendiPhone(
        req.body.deviceId,
      );
      throw Error('Errrror');
      return Promise.resolve(browserClientList.concat(iPhoneClientList));
    } catch (error) {
      console.log('push send error: ', error);
      return Promise.reject(new ServiceUnavailableException(error.message));
    }
  }
}
