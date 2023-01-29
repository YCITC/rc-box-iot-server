import { iOSClient } from './ios.client.entity';

describe('iOSClient class', () => {
  const nowLocaleDateString = new Date().toLocaleDateString();

  it('should return a webClient', () => {
    const iosClient = new iOSClient('jest Test', 'appId', 'iphone_token');
    expect(iosClient).toBeTruthy();
    expect(iosClient.subscribeTime.toLocaleDateString()).toEqual(
      nowLocaleDateString,
    );
    expect(iosClient.deviceId).toBe('jest Test');
  });
});
