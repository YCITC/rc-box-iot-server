import { ChromeClient } from './chrome.client.entity';

describe('WebClient class', () => {
  const now = new Date();
  const nowLocaleDateString = now.toLocaleDateString();

  it('should return a client', () => {
    const client = new ChromeClient(
      'jest Test',
      '102.0.0.0',
      'pubKey_uaRadWRQl8A4oaF_6PyjD9',
      'privKey_ZUB95eUT',
      'endPoint_https://fcm.googleapis.com/fcm/send/fIQ6Pq',
      'keysAuth_RltisQ',
      'keysP256dh_D1PoUqA',
    );
    expect(client).toBeTruthy();
    expect(client.subscribeTime.toLocaleDateString()).toEqual(
      nowLocaleDateString,
    );
    expect(client.deviceId).toBe('jest Test');
  });
});
