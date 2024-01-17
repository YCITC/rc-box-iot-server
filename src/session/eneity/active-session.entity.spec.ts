import * as dayjs from 'dayjs';
import ActiveSession from './active-session.entity';

describe('Active Session', () => {
  it('should careate activeSession', () => {
    const count = 15;
    const day = dayjs().subtract(1, 'day').toDate();
    const id = 1;
    const activeSession = new ActiveSession(count, day, id);

    expect(activeSession).toBeTruthy();
    expect(activeSession.count).toBeDefined();
    expect(activeSession.day).toBeDefined();
    expect(activeSession.id).toBeDefined();
  });
});
