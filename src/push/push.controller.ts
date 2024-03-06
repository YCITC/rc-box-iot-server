import { Controller } from '@nestjs/common';
import { Get, Post, Req, Param, Body } from '@nestjs/common';
import { BadRequestException, NotAcceptableException } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotAcceptableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import PushService from './push.service';
import RegisterChromeDto from './dto/register-chrome.dto';
import RegisterIPhoneDto from './dto/register-iphone.dto';
import ChromeClient from './entity/chrome.client.entity';
import iOSClient from './entity/ios.client.entity';
import PushClientInterface from './interface/push-client.interface';
import DevicesService from '../devices/devices.service';
import { Auth } from '../common/decorator';
import RolesEnum from '../common/enum';

@ApiTags('PushNotification')
@ApiBearerAuth()
@Controller('push')
export default class PushController {
  constructor(
    private readonly pushService: PushService,
    private devicesService: DevicesService,
  ) {}

  @Get('genChromeVAPID')
  @Auth(RolesEnum.ADMIN, RolesEnum.USER)
  @ApiOperation({ summary: 'gen VAPID for chrome' })
  @ApiResponse({
    status: 200,
    description: 'Will return publicKey and privateKey in object.',
    schema: {
      example: {
        publicKey: `BEjK-zifN-t2nc2UjISjwGhURmiRaa4atjXyXMPcIy6BLMpvs6y0OY_352T_HUwrQ1gJdZ-A_W1l-GbDLHewFMQ`,
        privateKey: '-qyMxJqPC7TPElaREk352lfp4kR8WabsAHF88d9d7bs',
      },
      type: 'object',
      properties: {
        publicKey: { type: 'string' },
        privateKey: { type: 'string' },
      },
    },
  })
  genChromeVapid() {
    return this.pushService.genChromeVapid();
  }

  @Post('subscribe/chrome')
  @Auth(RolesEnum.ADMIN, RolesEnum.USER)
  @ApiBadRequestResponse({
    description: 'Lost key',
  })
  @ApiNotAcceptableResponse({
    description: 'Current user has no device',
  })
  async subscribeChrome(
    @Body() registerChromeDto: RegisterChromeDto,
    @Req() req,
  ): Promise<ChromeClient> {
    const {
      deviceId,
      browserVersion,
      vapidPublicKey,
      vapidPrivateKey,
      endpoint,
      keysAuth,
      keysP256dh,
    } = registerChromeDto;
    if (!deviceId || deviceId === '') {
      throw new BadRequestException("Have no deviceId, it's length must > 0");
    }
    if (!browserVersion || browserVersion === '') {
      throw new BadRequestException(
        "Have no browserVersion, it's length must > 0",
      );
    }
    if (!vapidPublicKey || vapidPublicKey === '') {
      throw new BadRequestException(
        "Have no vapidPublicKey, it's length must > 0",
      );
    }
    if (!vapidPrivateKey || vapidPrivateKey === '') {
      throw new BadRequestException(
        "Have no vapidPrivateKey, it's length must > 0",
      );
    }
    if (!endpoint || endpoint === '') {
      throw new BadRequestException("Have no endpoint, it's length must > 0");
    }
    if (!keysAuth || keysAuth === '') {
      throw new BadRequestException("Have no keysAuth, it's length must > 0");
    }
    if (!keysP256dh || keysP256dh === '') {
      throw new BadRequestException("Have no keysP256dh, it's length must > 0");
    }

    const userHasDevice = await this.devicesService.checkDeviceWithUser(
      req.user.id,
      deviceId,
    );
    if (!userHasDevice) {
      throw new NotAcceptableException(
        `Incorrect. Current user (${req.user.username}) has no device ${deviceId}`,
      );
    }
    return this.pushService.chromeSubscribe(registerChromeDto);
  }

  @Post('subscribe/ios')
  @Auth(RolesEnum.ADMIN, RolesEnum.USER)
  @ApiNotAcceptableResponse({
    description: 'Current user has no device',
  })
  async subscribeIOS(
    @Body() registerIPhoneDto: RegisterIPhoneDto,
    @Req() req,
  ): Promise<iOSClient> {
    const { deviceId } = registerIPhoneDto;
    const { appId } = registerIPhoneDto;
    const { iPhoneToken } = registerIPhoneDto;

    if (deviceId === undefined || deviceId === '') {
      throw new BadRequestException("Have no deviceId, it's length must > 0");
    }
    if (appId === undefined || appId === '') {
      throw new BadRequestException("Have no deviceId, it's length must > 0");
    }
    if (iPhoneToken === undefined || iPhoneToken === '') {
      throw new BadRequestException(
        "Have no iPhoneToken, it's length must > 0",
      );
    }

    const userHasDevice = await this.devicesService.checkDeviceWithUser(
      req.user.id,
      deviceId,
    );
    if (!userHasDevice) {
      throw new NotAcceptableException(
        `Incorrect. Current user (${req.user.username}) has no device ${deviceId}`,
      );
    }
    const client = await this.pushService.iOSSubscribe(registerIPhoneDto);
    return Promise.resolve(client);
  }

  @Get('send/:deviceId')
  @Post('send/:deviceId')
  @ApiResponse({
    status: 200,
    description: `It will return the devices to which notifications will be sent.`,
  })
  async send(
    @Param('deviceId') deviceId: string,
  ): Promise<PushClientInterface[]> {
    const browserClientList = await this.pushService.sendChrome(deviceId);
    return Promise.resolve(browserClientList);

    // const iOSClientList = await this.pushService.sendiOS(deviceId);
    // return Promise.resolve(browserClientList.concat(iOSClientList));
  }
}
