import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import * as apn from '@parse/node-apn';
import * as asyncLib from 'async';

import { WebClient } from './entity/web.client.entity';
import { iOSClient } from './entity/ios.client.entity';
import { PushClientInterface } from './interface/push.client.interface';

@Injectable()
export class PushService {
  constructor(
    @InjectRepository(WebClient)
    private WebClientRepository: Repository<WebClient>,

    @InjectRepository(iOSClient)
    private IOSClientRepository: Repository<iOSClient>,
  ) {}

  genVapid(browserName) {
    let key = '';
    switch (browserName) {
      case 'Chrom/prettier/eslint-plugin-prettiere':
        // '<Your GCM API Key Here>'
        key = `BM7Z_5aIzx78z_kKGWOTPcMPeGQSZovDbiF-3VWpJ2nnr93jh0KfOE-IXaxSwehQPIPKkhHP_r8XHd4opGY_-roBM7Z_5aIzx78z_kKGWOTPcMPeGQSZovDbiF-3VWpJ2nnr93jh0KfOE-IXaxSwehQPIPKkhHP_r8XHd4opGY_-ro`;
        webpush.setGCMAPIKey(key);
        break;
      case 'Firefox':
        key = '';
        break;
      case 'Safari':
        key = '';
        break;
    }

    // VAPID keys should be generated only once.
    const vapidKeys = webpush.generateVAPIDKeys();

    return vapidKeys;
  }

  broswerSubscribe(pushRegisterDto): Promise<WebClient> {
    return this.WebClientRepository.save(pushRegisterDto);
  }

  iOSSubscribe(pushRegisterDto): Promise<iOSClient> {
    return this.IOSClientRepository.save(pushRegisterDto);
  }

  async sendWeb(deviceId): Promise<PushClientInterface[]> {
    try {
      const clientList = await this.WebClientRepository.find({
        where: {
          deviceId: deviceId,
        },
      });
      const pushClientList = [];
      if (clientList == undefined || clientList.length == 0) {
        return Promise.resolve([
          {
            uid: -1,
            deviceId: deviceId,
            clientType: 'browser',
            state: false,
            message: 'No registered client.',
            vapidPublicKey: '',
            iPhoneToken: '',
          },
        ]);
      }
      await asyncLib.forEachOf(clientList, (client, index, callback) => {
        try {
          webpush.setVapidDetails(
            'https://rc-box.yesseecity.com/',
            client.vapidPublicKey,
            client.vapidPrivateKey,
          );
          const pushSubscription = {
            endpoint: client.endpoint,
            keys: {
              auth: client.keysAuth,
              p256dh: client.keysP256dh,
            },
          };
          webpush
            .sendNotification(pushSubscription, 'Received A Box')
            .then(() => {
              // success
              // console.log('[notification] success index: ', index);
              pushClientList.push({
                uid: client.uid,
                deviceId: client.deviceId,
                clientType: 'browser',
                state: true,
                message: '',
                vapidPublicKey: client.vapidPublicKey,
                iPhoneToken: '',
              });
              callback(); // this callback is mean asyncLib.forEachOf iteratee functions have finished.
            })
            .catch((error) => {
              // failed
              // console.log('[notification] failed index: ', index);
              const errorMessage = '[webpush][' + error.name + ']' + error.body;
              pushClientList.push({
                uid: client.uid,
                deviceId: client.deviceId,
                clientType: 'browser',
                state: false,
                message: errorMessage,
                vapidPublicKey: client.vapidPublicKey,
                iPhoneToken: '',
              });
              callback(); // this callback is mean asyncLib.forEachOf iteratee functions have finished.
            });
        } catch (error) {
          // webpush libary failed
          // console.log('[notification] error index: ', index);
          const errorMessage = '[webpush][' + error.name + ']' + error.message;
          pushClientList.push({
            uid: client.uid,
            deviceId: client.deviceId,
            clientType: 'browser',
            state: false,
            message: errorMessage,
            vapidPublicKey: client.vapidPublicKey,
            iPhoneToken: '',
          });
          callback();
        }
      });
      return Promise.resolve(pushClientList);
    } catch (error) {
      console.log('try .WebClientRepository.find catch');
      return Promise.reject([
        { deviceId: deviceId, message: 'Find client failed.' + error.message },
      ]);
    }
  }

  async sendiPhone(deviceId): Promise<any> {
    const clientList = await this.IOSClientRepository.find({
      where: {
        deviceId: deviceId,
      },
    });
    if (clientList == undefined || clientList.length == 0) {
      return Promise.resolve([
        {
          uid: -1,
          deviceId: deviceId,
          clientType: 'iPhone',
          state: false,
          message: 'No registered client.',
          vapidPublicKey: '',
          iPhoneToken: '',
        },
      ]);
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
      // subtitle: 'You Got A Box',
      body: 'You Got A Box',
    };
    note.topic = 'yesseecity.rc-box-app-dev';
    console.log('clientList.length: ', clientList.length);
    const pushClientList = [];
    await asyncLib.forEachOf(clientList, (client, index, callback) => {
      note.topic = client.appId;
      apnProvider
        .send(note, client.iPhoneToken)
        .then((result) => {
          console.log('sent to iPhone:', result.sent[0].device);
          // success
          // console.log('[notification] success index: ', index);
          pushClientList.push({
            uid: client.uid,
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
            uid: client.uid,
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
  }
}
