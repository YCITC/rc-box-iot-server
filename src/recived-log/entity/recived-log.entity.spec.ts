import { ReceivedLog } from './recived-log.entity';

describe('ReceivedLog class', () => {
  it('should make a receivedLog with deviceId only', () => {
    const deviceId = 'jest test';
    const receivedLog = new ReceivedLog(deviceId);
    expect(receivedLog).toBeTruthy();
    expect(receivedLog.deviceId).toBe(deviceId);
  });

  it('should make a receivedLog with name and time', () => {
    const deviceId = 'jest test';
    const now = new Date();
    const receivedLog = new ReceivedLog(deviceId, now);
    expect(receivedLog).toBeTruthy();
    expect(receivedLog.time).toMatchObject(now);
    expect(receivedLog.deviceId).toBe(deviceId);
  });
  it('should make a receivedLog with name, time and id', () => {
    const deviceId = 'jest test';
    const now = new Date();
    const id = 12345;
    const receivedLog = new ReceivedLog(deviceId, now, id);
    expect(receivedLog).toBeTruthy();
    expect(receivedLog.time).toMatchObject(now);
    expect(receivedLog.deviceId).toBe(deviceId);
    expect(receivedLog.id).toBe(id);
  });
});
