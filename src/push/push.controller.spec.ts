import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as webpush from 'web-push';
import * as apn from '@parse/node-apn';

import { ChromeClient } from './entity/chrome.client.entity';
import { iOSClient } from './entity/ios.client.entity';
import { PushService } from './push.service';
import { PushController } from './push.controller';
import { DevicesService } from '../devices/devices.service';
import { Device } from '../devices/entities/device.entity';
import gcmConfig from '../config/gcm.config';

describe('PushController', () => {
  let controller: PushController;
  const deviceId1 = 'rc-box-test-12301';
  const deviceId2 = 'rc-box-test-53104';
  const ownerUserId = 1;
  const dbDevices = [
    {
      deviceId: deviceId1,
      ownerUserId: ownerUserId,
      alias: '',
    },
    {
      deviceId: deviceId2,
      ownerUserId: ownerUserId,
      alias: '',
    },
  ];
  const registerChromeDto = {
    deviceId: deviceId1,
    browserVersion: '1.0.0',
    vapidPublicKey: 'vapidPublicKey_01',
    vapidPrivateKey: 'vapidPrivateKey_01',
    endpoint: 'endpoint_01',
    keysAuth: 'keysAuth_01',
    keysP256dh: 'keysP256dh_01',
  };
  const registerIPhoneDto = {
    deviceId: deviceId1,
    iPhoneToken: 'tokenString',
    appId: 'yesseecity.rc-box-app-dev',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(gcmConfig)],
      controllers: [PushController],
      providers: [
        PushService,
        {
          provide: getRepositoryToken(ChromeClient),
          useValue: {
            find: jest.fn().mockResolvedValue([
              {
                ...registerChromeDto,
                id: 1,
                subscribeTime: new Date(),
              },
            ]),
            save: jest.fn().mockResolvedValue({
              ...registerChromeDto,
              id: 1,
              subscribeTime: new Date(),
            }),
          },
        },
        {
          provide: getRepositoryToken(iOSClient),
          useValue: {
            find: jest.fn().mockResolvedValue([
              {
                ...registerIPhoneDto,
                id: 2,
                subscribeTime: new Date(),
              },
            ]),
            save: jest.fn().mockResolvedValue({
              ...registerIPhoneDto,
              id: 2,
              subscribeTime: new Date(),
            }),
          },
        },
        DevicesService,
        {
          provide: getRepositoryToken(Device),
          useValue: {
            find: jest.fn().mockResolvedValue(dbDevices),
            findOneBy: (obj) => {
              const foundDevice = dbDevices.find(
                (device) => device.deviceId == obj.deviceId,
              );
              return Promise.resolve(foundDevice);
            },
          },
        },
      ],
    }).compile();

    controller = module.get<PushController>(PushController);
  });

  it('service should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('genChromeVapid', () => {
    it('should return has keys publicKey and privateKey', async () => {
      const vapidKeys = await controller.genChromeVapid();
      expect(vapidKeys).toHaveProperty('publicKey');
      expect(vapidKeys).toHaveProperty('privateKey');
    });
  });

  describe('subscribeChrome', () => {
    it('should insert a chromeClient info', async () => {
      const client = await controller.subscribeChrome(registerChromeDto, {
        user: {
          username: 'user',
          id: 1,
        },
      });
      expect(client).toBeDefined();
      expect(client.deviceId).toBe(deviceId1);
      expect(client).toHaveProperty('id');
      expect(client).toHaveProperty('subscribeTime');
    });
  });

  describe('iOSSubscribe', () => {
    it('should insert a iOSClient info', async () => {
      const obj = await controller.subscribeIOS(registerIPhoneDto, {
        user: {
          username: 'user',
          id: 1,
        },
      });
      expect(obj).toBeDefined();
      expect(obj.deviceId).toBe(deviceId1);
      expect(obj).toHaveProperty('id');
      expect(obj).toHaveProperty('subscribeTime');
    });
  });

  describe('send', () => {
    it('should return clients with state of send notification', async () => {
      // Just mock the return value of apnProvider.send, we don't make apn.Provider as `providers
      apn.Provider.prototype.send = jest.fn().mockImplementation(async () => {
        return Promise.resolve(true);
      });
      webpush.sendNotification = jest.fn().mockRejectedValue(true);
      const clients = await controller.send(deviceId1);
      expect(clients).toBeDefined();
      expect(clients.length).toBe(2);
    });
  });
});
