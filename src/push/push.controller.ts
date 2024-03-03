import { Controller } from '@nestjs/common';
import { Get, Post, Req, Param, Body } from '@nestjs/common';
import { BadRequestException, NotAcceptableException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  async subscribeChrome(
    @Body() registerChromeDto: RegisterChromeDto,
    @Req() req,
  ): Promise<ChromeClient> {
    const { deviceId } = registerChromeDto;
    const userHasDevice = await this.devicesService.checkDeviceWithUser(
      req.user.id,
      deviceId,
    );
    if (!userHasDevice) {
      throw new NotAcceptableException(
        `Incorrect. Current user (${req.user.username}) has no device ${deviceId}`,
      );
    }
    if (deviceId === undefined || deviceId === '') {
      return Promise.reject(
        new BadRequestException("Have no deviceId, it's length must > 0"),
      );
    }

    const { browserVersion } = registerChromeDto;
    if (browserVersion === undefined || browserVersion === '') {
      return Promise.reject(
        new BadRequestException("Have no browserVersion, it's length must > 0"),
      );
    }
    const { vapidPublicKey } = registerChromeDto;
    if (vapidPublicKey === undefined || vapidPublicKey === '') {
      return Promise.reject(
        new BadRequestException("Have no vapidPublicKey, it's length must > 0"),
      );
    }
    const { vapidPrivateKey } = registerChromeDto;
    if (vapidPrivateKey === undefined || vapidPrivateKey === '') {
      return Promise.reject(
        new BadRequestException(
          "Have no vapidPrivateKey, it's length must > 0",
        ),
      );
    }
    const { endpoint } = registerChromeDto;
    if (endpoint === undefined || endpoint === '') {
      return Promise.reject(
        new BadRequestException("Have no endpoint, it's length must > 0"),
      );
    }
    const { keysAuth } = registerChromeDto;
    if (keysAuth === undefined || keysAuth === '') {
      return Promise.reject(
        new BadRequestException("Have no keysAuth, it's length must > 0"),
      );
    }
    const { keysP256dh } = registerChromeDto;
    if (keysP256dh === undefined || keysP256dh === '') {
      return Promise.reject(
        new BadRequestException("Have no keysP256dh, it's length must > 0"),
      );
    }
    return this.pushService.broswerSubscribe(registerChromeDto);
  }

  @Post('subscribe/ios')
  @Auth(RolesEnum.ADMIN, RolesEnum.USER)
  async subscribeIOS(
    @Body() registerIPhoneDto: RegisterIPhoneDto,
    @Req() req,
  ): Promise<iOSClient> {
    const { deviceId } = registerIPhoneDto;
    if (deviceId === undefined || deviceId === '') {
      return Promise.reject(
        new BadRequestException("Have no deviceId, it's length must > 0"),
      );
    }
    const { appId } = registerIPhoneDto;
    if (appId === undefined || appId === '') {
      return Promise.reject(
        new BadRequestException("Have no deviceId, it's length must > 0"),
      );
    }
    const { iPhoneToken } = registerIPhoneDto;
    if (iPhoneToken === undefined || iPhoneToken === '') {
      return Promise.reject(
        new BadRequestException("Have no iPhoneToken, it's length must > 0"),
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
    // return this.pushService.iOSSubscribe(registerIPhoneDto);
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
