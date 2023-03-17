import { WebClient } from './web.client.entity';

describe('WebClient class', () => {
  const now = new Date();
  const nowLocaleDateString = now.toLocaleDateString();

  it('should return a webClient', () => {
    const webClient = new WebClient(
      'jest Test',
      'Chrome',
      '102.0.0.0',
      'pubKey_uaRadWRQl8A4oaF_6PyjD9',
      'privKey_ZUB95eUT',
      'endPoint_https://fcm.googleapis.com/fcm/send/fIQ6Pq',
      'keysAuth_RltisQ',
      'keysP256dh_D1PoUqA',
    );
    expect(webClient).toBeTruthy();
    expect(webClient.subscribeTime.toLocaleDateString()).toEqual(
      nowLocaleDateString,
    );
    expect(webClient.deviceId).toBe('jest Test');
  });
});
