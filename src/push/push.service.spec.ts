import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import * as apn from '@parse/node-apn';

import ChromeClient from './entity/chrome.client.entity';
import IOSClient from './entity/ios.client.entity';
import PushService from './push.service';
import gcmConfig from '../config/gcm.config';

describe('PushService', () => {
  let service: PushService;
  let repoChrome: Repository<ChromeClient>;
  let repoIOS: Repository<IOSClient>;

  const deviceId = 'rc-box-test-12301';
  const registerChromeDto = {
    deviceId,
    browserVersion: '1.0.0',
    vapidPublicKey: 'vapidPublicKey_01',
    vapidPrivateKey: 'vapidPrivateKey_01',
    endpoint: 'endpoint_01',
    keysAuth: 'keysAuth_01',
    keysP256dh: 'keysP256dh_01',
  };
  const registerChromeDto2 = {
    deviceId,
    browserVersion: '102.0.0.0',
    vapidPublicKey: `BM-OKm4cmnKx9zkMhqP6jJppzJCxCXL8aLs7ZySSbqPlWPn_hmB0bEDguaRadWRQl8A4oaF_6PyjD9q5p-6tgWw`,
    vapidPrivateKey: `4pI3o3iAAocpxIZUB95eUTvgXCKiuQzNfJSqByvmYRw`,
    endpoint: `https://fcm.googleapis.com/fcm/send/fIQ6PqdkgJQ:APA91bHDCq87n4VFSCiHen3v2QVFYCyoywLcRezfJ69kT8lickUrz9vqQPBtXnY99YR7XjpjKaXHc3RuLRmQW7XRHyVIBn8XMtmRbLprLL5zWG8fpZ6r1y5Tjr8Iff3dfkWyjyOpOqDo`,
    keysAuth: 'AfeoiYTENxJylrgnRltisQ',
    keysP256dh: `BD1PoUqAA4f_gENcke5W7Q8Elt1BX9OMYTkpTQMv1-dL9D1rPD4ThfKE6dBNi1k1_Ji4soNPlywUMzuMU8TtBvg`,
  };
  const registerIPhoneDto = {
    deviceId,
    iPhoneToken: 'tokenString',
    appId: 'yesseecity.rc-box-app-dev',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(gcmConfig)],
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
              {
                ...registerChromeDto2,
                id: 2,
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
          provide: getRepositoryToken(IOSClient),
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
      ],
    }).compile();

    service = module.get<PushService>(PushService);
    repoChrome = module.get<Repository<ChromeClient>>(
      getRepositoryToken(ChromeClient),
    );
    repoIOS = module.get<Repository<IOSClient>>(getRepositoryToken(IOSClient));
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('genChromeVapid', () => {
    it('should return has keys publicKey and privateKey', async () => {
      const vapidKeys = await service.genChromeVapid();
      expect(vapidKeys).toHaveProperty('publicKey');
      expect(vapidKeys).toHaveProperty('privateKey');
    });
  });

  describe('broswerSubscribe', () => {
    it('should insert a chromeClient info', async () => {
      const obj = await service.broswerSubscribe(registerChromeDto);
      expect(obj).toBeDefined();
      expect(obj.deviceId).toBe(deviceId);
      expect(obj).toHaveProperty('id');
      expect(obj).toHaveProperty('subscribeTime');
    });
  });

  describe('iOSSubscribe', () => {
    it('should insert a IOSClient info', async () => {
      const obj = await service.iOSSubscribe(registerIPhoneDto);
      expect(obj).toBeDefined();
      expect(obj.deviceId).toBe(deviceId);
      expect(obj).toHaveProperty('id');
      expect(obj).toHaveProperty('subscribeTime');
    });
  });

  describe('sendChrome', () => {
    it('should find all of specific deviceId', async () => {
      webpush.sendNotification = jest.fn().mockRejectedValue(true);
      const repoSpy = jest.spyOn(repoChrome, 'find');
      expect(service.sendChrome(deviceId)).resolves.toBeDefined();
      expect(repoSpy).toBeCalledWith({
        order: {
          id: 'DESC',
        },
        where: {
          deviceId,
        },
      });
    });
  });

  describe('sendiOS', () => {
    it('should find all of specific deviceId', async () => {
      apn.Provider.prototype.send = jest.fn().mockImplementation(async () => {
        return Promise.resolve(true);
      });
      const repoSpy = jest.spyOn(repoIOS, 'find');
      expect(service.sendiOS(deviceId)).resolves.toBeDefined();
      expect(repoSpy).toBeCalledWith({
        order: {
          id: 'DESC',
        },
        where: {
          deviceId,
        },
      });
    });
  });
});
