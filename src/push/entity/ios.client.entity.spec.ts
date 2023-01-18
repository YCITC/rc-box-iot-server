import { iOSClient } from './ios.client.entity';

describe('iOSClient class', () => {
  const nowLocaleDateString = new Date().toLocaleDateString();
  it('should make a iosClient with no fields', () => {
    const iosClient = new iOSClient();
    expect(iosClient).toBeTruthy();
    expect(iosClient.subscribeTime).toMatchObject(
      new Date(nowLocaleDateString),
    );
    expect(iosClient.deviceId).toBeUndefined();
  });
  it('should make a iosClient with name only', () => {
    const iosClient = new iOSClient('jest Test');
    expect(iosClient).toBeTruthy();
    expect(iosClient.subscribeTime).toMatchObject(
      new Date(nowLocaleDateString),
    );
    expect(iosClient.deviceId).toBe('jest Test');
  });
});
