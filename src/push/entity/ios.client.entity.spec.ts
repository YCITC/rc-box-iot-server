import { iOSClient } from './ios.client.entity';

describe('iOSClient class', () => {
  const nowLocaleDateString = new Date().toLocaleDateString();

  it('should throw Error when make a iosClient with no fields', () => {
    try {
      new iOSClient('');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toEqual(Error("Have no deviceId, it's length must > 0"));
    }
  });
  it('should make a iosClient with name only', () => {
    try {
      new iOSClient('jest Test');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toEqual(Error("Have no appId, it's length must > 0"));
    }
  });

  it('should return a webClient', () => {
    const iosClient = new iOSClient('jest Test', 'appId', 'iphone_token');
    expect(iosClient).toBeTruthy();
    expect(iosClient.subscribeTime.toLocaleDateString()).toEqual(
      nowLocaleDateString,
    );
    expect(iosClient.deviceId).toBe('jest Test');
  });
});
