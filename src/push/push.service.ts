import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';

import { PushClient } from './interface/push.client.entity';
import { PushClientInterface } from './interface/push.client.interface';

@Injectable()
export class PushService {
  constructor(
    @InjectRepository(PushClient)
    private PushClientRepository: Repository<PushClient>,
  ) {}

  genVapid() {
    // VAPID keys should be generated only once.
    const vapidKeys = webpush.generateVAPIDKeys();

    // '<Your GCM API Key Here>'
    const key = `BM7Z_5aIzx78z_kKGWOTPcMPeGQSZovDbiF-3VWpJ2nnr93jh0KfOE-IXaxSwehQPIPKkhHP_r8XHd4opGY_-roBM7Z_5aIzx78z_kKGWOTPcMPeGQSZovDbiF-3VWpJ2nnr93jh0KfOE-IXaxSwehQPIPKkhHP_r8XHd4opGY_-ro`;
    webpush.setGCMAPIKey(key);

    return vapidKeys;
  }

  subscribe(pushKeysDto): Promise<PushClient> {
    return this.PushClientRepository.save(pushKeysDto);
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
          'http://127.0.0.1:8080/',
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
        webpush.sendNotification(pushSubscription, 'Your Push Payload Text');
      });
    });
    return true;

    // // Get vapid keys for Database;
    // console.log('send');
  }
}
