import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WebClient } from './entity/web.client.entity';
import { iOSClient } from './entity/ios.client.entity';
import { PushService } from './push.service';

describe('PushService', () => {
  let service: PushService;
  let repoWeb: Repository<WebClient>;
  let repoIOS: Repository<iOSClient>;

  const pushRegisterDto_1 = {
    deviceId: 'jest_test_device',
    clientType: 'browser',
    browserName: 'jest_test',
    browserVersion: '1.0.0',
    vapidPublicKey: 'vapidPublicKey_01',
    vapidPrivateKey: 'vapidPrivateKey_01',
    endpoint: 'endpoint_01',
    keysAuth: 'keysAuth_01',
    keysP256dh: 'keysP256dh_01',
  };
  const pushRegisterDto_2 = {
    deviceId: 'jest_test_device',
    clientType: 'iPhone',
    iPhoneToken: 'tokenString',
    appId: 'yesseecity.rc-box-app-dev',
  };
  const clientList = [
    {
      subscribeTime: new Date('2023-01-30T00:05:25.000Z'),
      deviceId: 'jest_test_device',
      browserName: 'jest_test',
      browserVersion: '1.0.0',
      vapidPublicKey: `BM-OKm4cmnKx9zkMhqP6jJppzJCxCXL8aLs7ZySSbqPlWPn_hmB0bEDguaRadWRQl8A4oaF_6PyjD9q5p-6tgWw`,
      vapidPrivateKey: '4pI3o3iAAocpxIZUB95eUTvgXCKiuQzNfJSqB_00000',
      endpoint: `https://fcm.googleapis.com/fcm/send/fIQ6PqdkgJQ:APA91bHDCq87n4VFSCiHen3v2QVFYCyoywLcRezfJ69kT8lickUrz9vqQPBtXnY99YR7XjpjKaXHc3RuLRmQW7XRHyVIBn8XMtmRbLprLL5zWG8fpZ6r1y5Tjr8Iff3dfkWyjyOpOqDo`,
      keysAuth: 'AAAAAAAAAAAAlrgnRltisQ',
      keysP256dh:
        'BD1PoUqAA4f_gENcke5W7Q8Elt1BX9OMYTkpTQMv1-dL9D1rPD4ThfKE6dBNi1k1_Ji4soNPlywUMzuMU8TtBvg',
      uid: 8,
    },
    {
      subscribeTime: new Date('2023-01-30T00:05:14.000Z'),
      deviceId: 'jest_test_device',
      browserName: 'jest_test',
      browserVersion: '1.0.0',
      vapidPublicKey: `BM-OKm4cmnKx9zkMhqP6jJppzJCxCXL8aLs7ZySSbqPlWPn_hmB0bEDguaRadWRQl8A4oaF_6PyjD9q5p-6tgWw__`,
      vapidPrivateKey: '4pI3o3iAAocpxIZUB95eUTvgXCKiuQzNfJSqB_00000',
      endpoint: 'https://fcm.googleapis.com/fcm/send/fIQ:20z',
      keysAuth: 'AAAAAAAAAAAAlrgnRltisQ',
      keysP256dh: `BD1PoUqAA4f_gENcke5W7Q8Elt1BX9OMYTkpTQMv1-dL9D1rPD4ThfKE6dBNi1k1_Ji4soNPlywUMzuMU8TtBvg`,
      uid: 7,
    },
    {
      subscribeTime: new Date('2022-06-16T08:19:37.000Z'),
      deviceId: 'jest_test_device',
      browserName: 'Chrome',
      browserVersion: '102.0.0.0',
      vapidPublicKey: `BM-OKm4cmnKx9zkMhqP6jJppzJCxCXL8aLs7ZySSbqPlWPn_hmB0bEDguaRadWRQl8A4oaF_6PyjD9q5p-6tgWw`,
      vapidPrivateKey: '4pI3o3iAAocpxIZUB95eUTvgXCKiuQzNfJSqByvmYRw',
      endpoint: `https://fcm.googleapis.com/fcm/send/fIQ6PqdkgJQ:APA91bHDCq87n4VFSCiHen3v2QVFYCyoywLcRezfJ69kT8lickUrz9vqQPBtXnY99YR7XjpjKaXHc3RuLRmQW7XRHyVIBn8XMtmRbLprLL5zWG8fpZ6r1y5Tjr8Iff3dfkWyjyOpOqDo`,
      keysAuth: 'AfeoiYTENxJylrgnRltisQ',
      keysP256dh: `BD1PoUqAA4f_gENcke5W7Q8Elt1BX9OMYTkpTQMv1-dL9D1rPD4ThfKE6dBNi1k1_Ji4soNPlywUMzuMU8TtBvg`,
      uid: 6,
    },
  ];
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushService,
        {
          provide: getRepositoryToken(WebClient),
          useValue: {
            find: jest.fn().mockResolvedValue(clientList),
            save: jest.fn().mockResolvedValue({
              ...pushRegisterDto_1,
              uid: '1',
              subscribeTime: new Date(),
            }),
          },
        },
        {
          provide: getRepositoryToken(iOSClient),
          useValue: {
            find: jest.fn().mockResolvedValue(''),
            save: jest.fn().mockResolvedValue(''),
          },
        },
      ],
    }).compile();

    service = module.get<PushService>(PushService);
    repoWeb = module.get<Repository<WebClient>>(getRepositoryToken(WebClient));
    repoIOS = module.get<Repository<iOSClient>>(getRepositoryToken(iOSClient));
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('genVapid', () => {
    it('should return an object', async () => {
      const vapidKeys = await service.genVapid('Chrome');
      expect(vapidKeys).toHaveProperty('publicKey');
      expect(vapidKeys).toHaveProperty('privateKey');
    });
  });

  describe('broswerSubscribe', () => {
    it('should insert a webClient info', async () => {
      const obj = await service.broswerSubscribe(pushRegisterDto_1);
      expect(obj).toBeDefined();
      expect(obj.deviceId).toBe('jest_test_device');
      expect(obj).toHaveProperty('uid');
      expect(obj).toHaveProperty('subscribeTime');
    });
  });
  describe('iOSSubscribe', () => {
    it('should insert a iOSClient info', async () => {
      const obj = await service.broswerSubscribe(pushRegisterDto_2);
      expect(obj).toBeDefined();
      expect(obj.deviceId).toBe('jest_test_device');
      expect(obj).toHaveProperty('uid');
      expect(obj).toHaveProperty('subscribeTime');
    });
  });
  describe('sendWeb', () => {
    it('should find all of specific deviceId', async () => {
      const repoSpy = jest.spyOn(repoWeb, 'find');
      expect(service.sendWeb('jest_test_device')).resolves.toBeDefined();
      expect(repoSpy).toBeCalledWith({
        where: {
          deviceId: 'jest_test_device',
        },
      });
    });
  });

  describe('sendiPhone', () => {
    it('should find all of specific deviceId', async () => {
      const repoSpy = jest.spyOn(repoIOS, 'find');
      expect(service.sendiPhone('jest_test_device')).resolves.toBeDefined();
      expect(repoSpy).toBeCalledWith({
        where: {
          deviceId: 'jest_test_device',
        },
      });
    });
  });
});
