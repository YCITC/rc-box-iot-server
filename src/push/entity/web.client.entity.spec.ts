import { WebClient } from './web.client.entity';

describe('WebClient class', () => {
  const nowLocaleDateString = new Date().toLocaleDateString();
  it('should make a webClient with no fields', () => {
    const webClient = new WebClient();
    expect(webClient).toBeTruthy();
    expect(webClient.subscribeTime).toMatchObject(
      new Date(nowLocaleDateString),
    );
    expect(webClient.deviceId).toBeUndefined();
  });
  it('should make a webClient with name only', () => {
    const webClient = new WebClient('jest Test');
    expect(webClient).toBeTruthy();
    expect(webClient.subscribeTime).toMatchObject(
      new Date(nowLocaleDateString),
    );
    expect(webClient.deviceId).toBe('jest Test');
  });
});
