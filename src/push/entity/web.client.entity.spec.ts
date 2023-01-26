import { WebClient } from './web.client.entity';

describe('WebClient class', () => {
  const now = new Date();
  const nowLocaleDateString = now.toLocaleDateString();

  it('should throw Error when make a webClient with no fields', () => {
    try {
      new WebClient('');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toEqual(Error("Have no deviceId, it's length must > 0"));
    }
  });

  it('should throw Error when make a webClient with name only', () => {
    try {
      new WebClient('jest Test');
    } catch (error) {
      expect(error).toEqual(Error("Have no browserName, it's length must > 0"));
    }
  });

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
