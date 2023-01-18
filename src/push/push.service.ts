import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import * as apn from '@parse/node-apn';

import { WebClient } from './entity/web.client.entity';
import { iOSClient } from './entity/ios.client.entity';

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

  // async send(deviceId): boolean {
  sendWeb(deviceId): any {
    this.WebClientRepository.find({
      where: {
        deviceId: deviceId,
      },
    }).then((clientList) => {
      clientList.forEach((client) => {
        // console.log(client);
        webpush.setVapidDetails(
          'https://rc-box.yesseecity.com/',
          client.vapidPublicKey,
          client.vapidPrivateKey,
        );
        // This is the same output of calling JSON.stringify on a PushSubscription
        const pushSubscription = {
          endpoint: client.endpoint,
          keys: {
            auth: client.keysAuth,
            p256dh: client.keysP256dh,
          },
        };
        webpush.sendNotification(pushSubscription, 'Received A Box');
      });
    });
    return;
  }

  sendiPhone(deviceId): any {
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
    // const a1 = new apn.NotificationAlertOptions;
    // export interface NotificationAlertOptions {
    //   title?: string;
    //   subtitle?: string;
    //   body: string;
    //   "title-loc-key"?: string;
    //   "title-loc-args"?: string[];
    //   "action-loc-key"?: string;
    //   "loc-key"?: string;
    //   "loc-args"?: string[];
    //   "launch-image"?: string;
    // }

    this.IOSClientRepository.find({
      where: {
        deviceId: deviceId,
      },
    }).then((clientList) => {
      // console.log('clientList', clientList);
      clientList.forEach((client) => {
        note.topic = client.appId;
        apnProvider.send(note, client.iPhoneToken).then((result) => {
          console.log('sent to iPhone:', result.sent[0].device);
        });
      });
    });
    return;
  }
}
