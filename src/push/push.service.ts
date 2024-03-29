import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import * as apn from '@parse/node-apn';

import ChromeClient from './entity/chrome.client.entity';
import IOSClient from './entity/ios.client.entity';
import PushClientInterface from './interface/push-client.interface';
import RegisterChromeDto from './dto/register-chrome.dto';

@Injectable()
export default class PushService {
  constructor(
    @InjectRepository(ChromeClient)
    private ChromeClientRepository: Repository<ChromeClient>,
    @InjectRepository(IOSClient)
    private IOSClientRepository: Repository<IOSClient>,
    private configService: ConfigService,
  ) {}

  genChromeVapid() {
    webpush.setGCMAPIKey(this.configService.get('google.WebPush.APIKey'));
    // VAPID keys should be generated only once.
    const vapidKeys = webpush.generateVAPIDKeys();

    return vapidKeys;
  }

  async chromeSubscribe(dto: RegisterChromeDto): Promise<ChromeClient> {
    return this.ChromeClientRepository.save(dto);
  }

  async iOSSubscribe(registerIPhoneDto): Promise<IOSClient> {
    return this.IOSClientRepository.save(registerIPhoneDto);
  }

  async sendChrome(deviceId): Promise<PushClientInterface[]> {
    const clientList = await this.ChromeClientRepository.find({
      order: {
        id: 'DESC',
      },
      where: {
        deviceId,
      },
    });
    const pushedClientList = [];
    const failedClientList = [];
    const clientPromises = clientList.map(async (client) => {
      try {
        webpush.setVapidDetails(
          'https://rc-box.yesseecity.com/',
          client.vapidPublicKey,
          client.vapidPrivateKey,
        );
      } catch (error) {
        const errorMessage = `[webpush][${error.name}]${error.message}`;
        failedClientList.push({
          id: client.id,
          deviceId: client.deviceId,
          clientType: 'Chrome',
          state: false,
          message: errorMessage,
          vapidPublicKey: client.vapidPublicKey,
          iPhoneToken: '',
        });
        return Promise.reject(error);
      }
      const pushSubscription = {
        endpoint: client.endpoint,
        keys: {
          auth: client.keysAuth,
          p256dh: client.keysP256dh,
        },
      };
      try {
        await webpush.sendNotification(pushSubscription, 'Received A Box');
        pushedClientList.push({
          id: client.id,
          deviceId: client.deviceId,
          clientType: 'Chrome',
          state: true,
          message: '',
          vapidPublicKey: client.vapidPublicKey,
          iPhoneToken: '',
        });
      } catch (error) {
        const errorMessage = `[webpush][${error.name}]${error.message}`;
        failedClientList.push({
          id: client.id,
          deviceId: client.deviceId,
          clientType: 'Chrome',
          state: false,
          message: errorMessage,
          vapidPublicKey: client.vapidPublicKey,
          iPhoneToken: '',
        });
      }
      return Promise.resolve();
    });
    await Promise.allSettled(clientPromises);
    /* 
    * Promise 用法備註
      如果用 await Promise.any(clientPromises);
      那麼在 clientList.map 的 await webpush.sendNotification(pushSubscription, 'Received A Box');
      在最後一筆時，如果成功的話，後面的 pushedClientList.push({***}) 不執行
    */

    return Promise.resolve(pushedClientList.concat(failedClientList));
  }

  async sendiOS(deviceId): Promise<any> {
    const clientList = await this.IOSClientRepository.find({
      order: {
        id: 'DESC',
      },
      where: {
        deviceId,
      },
    });
    if (clientList === undefined || clientList.length === 0) {
      return Promise.resolve([]);
    }
    const options = {
      token: {
        key: 'assets/ApplePushNotificationsAuthKey.p8',
        keyId: 'ZWCH8DLT2N',
        teamId: 'S8885JL4B8',
      },
      production: false,
    };
    const apnProvider = new apn.Provider(options);
    const note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 3;
    note.sound = 'ping.aiff';
    note.alert = {
      title: 'RC-Box',
      body: 'You Got A Box package',
    };
    note.topic = 'yesseecity.rc-box-app-dev'; // same to appId
    const pushedClientList = [];
    const failedClientList = [];

    const clientPromises = clientList.map(async (client) => {
      note.topic = client.appId;
      try {
        await apnProvider.send(note, client.iPhoneToken);
        // console.log('[notification] success iOS client.id: ', client.id);
        pushedClientList.push({
          id: client.id,
          deviceId: client.deviceId,
          clientType: 'iPhone',
          state: true,
          message: '',
          vapidPublicKey: '',
          iPhoneToken: '',
        });
      } catch (error) {
        // failed
        // console.log('[notification] failed iOS client.id: ', client.id);
        const errorMessage = `[webpush][${error.name}]${error.message}`;
        failedClientList.push({
          id: client.id,
          deviceId: client.deviceId,
          clientType: 'iPhone',
          state: false,
          message: errorMessage,
          vapidPublicKey: '',
          iPhoneToken: '',
        });
      }
    });
    await Promise.allSettled(clientPromises);
    return Promise.resolve(pushedClientList.concat(failedClientList));
  }
}
