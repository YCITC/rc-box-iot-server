import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';

import { PushClient } from './interface/push.client.entity';
import { iOSClient } from './interface/ios.client.entity';

@Injectable()
export class PushService {
  constructor(
    @InjectRepository(PushClient)
    private PushClientRepository: Repository<PushClient>,

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

  broswerSubscribe(pushRegisterDto): Promise<PushClient> {
    return this.PushClientRepository.save(pushRegisterDto);
  }

  iOSSubscribe(pushRegisterDto): Promise<iOSClient> {
    return this.IOSClientRepository.save(pushRegisterDto);
  }

  // async send(deviceId): boolean {
  send(deviceId): boolean {
    this.PushClientRepository.find({
      where: {
        deviceId: deviceId,
      },
    }).then((clientList) => {
      clientList.forEach((client) => {
        console.log(client);
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
    return true;

    // // Get vapid keys for Database;
    // console.log('send');
  }
}
