import Device from './device.entity';

describe('Device class', () => {
  it('should make a device', () => {
    const deviceId = 'box-v1-a02315';
    const ownerUserId = 1;
    const alias = 'my box';
    const device = new Device(deviceId, ownerUserId, alias);
    expect(device).toBeTruthy();
    expect(device.deviceId).toBeDefined();
    expect(device.ownerUserId).toBeDefined();
    expect(device.alias).toBeDefined();
    expect(device.createdTime).toBeDefined();
  });
});
