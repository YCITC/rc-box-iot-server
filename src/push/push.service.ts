import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import * as apn from '@parse/node-apn';

import { ConfigService } from '@nestjs/config';
import { ChromeClient } from './entity/chrome.client.entity';
import { iOSClient } from './entity/ios.client.entity';
import { PushClientInterface } from './interface/push-client.interface';

@Injectable()
export class PushService {
  constructor(
    @InjectRepository(ChromeClient)
    private ChromeClientRepository: Repository<ChromeClient>,
    @InjectRepository(iOSClient)
    private IOSClientRepository: Repository<iOSClient>,
    private configService: ConfigService,
  ) {}

  genChromeVapid() {
    webpush.setGCMAPIKey(this.configService.get('GCM.APIKey'));
    // VAPID keys should be generated only once.
    const vapidKeys = webpush.generateVAPIDKeys();

    return vapidKeys;
  }

  async broswerSubscribe(pushRegisterChromeDto): Promise<ChromeClient> {
    return this.ChromeClientRepository.save(pushRegisterChromeDto);
  }

  async iOSSubscribe(registerIPhoneDto): Promise<iOSClient> {
    return this.IOSClientRepository.save(registerIPhoneDto);
  }

  async sendChrome(deviceId): Promise<PushClientInterface[]> {
    const clientList = await this.ChromeClientRepository.find({
      order: {
        id: 'DESC',
      },
      where: {
        deviceId: deviceId,
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
        const errorMessage = '[webpush][' + error.name + ']' + error.message;
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
        const errorMessage = '[webpush][' + error.name + ']' + error.message;
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
        deviceId: deviceId,
      },
    });
    if (clientList == undefined || clientList.length == 0) {
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
    note.topic = 'yesseecity.rc-box-app-dev'; //same to appId
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
        const errorMessage = '[webpush][' + error.name + ']' + error.message;
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

    /*
    const arrayToResolve = pushedClientList.concat(failedClientList);

    return Promise.resolve(arrayToResolve);
    // TODO: remove asyncLib
    
    await asyncLib.forEachOf(clientList, (client, index, callback) => {
      note.topic = client.appId;
      apnProvider
        .send(note, client.iPhoneToken)
        .then((result) => {
          console.log('sent to iPhone:', result.sent[0].device);
          // success
          // console.log('[notification] success index: ', index);
          pushClientList.push({
            id: client.id,
            deviceId: client.deviceId,
            clientType: 'iPhone',
            state: true,
            message: '',
            vapidPublicKey: '',
            iPhoneToken: '',
          });
          callback(); // this callback is mean asyncLib.forEachOf iteratee functions have finished.
        })
        .catch((error) => {
          // failed
          // console.log('[notification] failed index: ', index);
          const errorMessage = '[webpush][' + error.name + ']' + error.body;
          pushClientList.push({
            id: client.id,
            deviceId: client.deviceId,
            clientType: 'iPhone',
            state: false,
            message: errorMessage,
            vapidPublicKey: '',
            iPhoneToken: '',
          });
          callback(); // this callback is mean asyncLib.forEachOf iteratee functions have finished.
        });
    });
    return Promise.resolve(true);
    */
  }
}
