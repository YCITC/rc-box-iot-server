import { ReceivedLog } from './recived-log.entity';

describe('ReceivedLog class', () => {
  it('should make a receivedLog with no fields', () => {
    const now = new Date();
    const receivedLog = new ReceivedLog();
    expect(receivedLog).toBeTruthy();
    expect(receivedLog.time).toMatchObject(new Date(now.toLocaleDateString()));
    expect(receivedLog.deviceId).toBe('');
  });
  it('should make a receivedLog with name only', () => {
    const receivedLog = new ReceivedLog('jest Test');
    expect(receivedLog).toBeTruthy();
    expect(receivedLog.deviceId).toBe('jest Test');
  });
});
