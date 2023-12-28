import User from './user.entity';
import UserAction, { inverseSide, typeFunctionOrTarget } from './user-action.entity';

describe('User Action Entity', () => {
  it('should make an userAction', () => {
    const email = '1@2.3';
    const username = 'Tester';
    const fullName = 'Tester Jest';
    const password = 'weNeedPassword';
    const phoneNumber = '0900123456';
    const address =
      'No. 7, Section 5, Xinyi Road, Xinyi District · Taipei · Taiwan';
    const zipCode = '110';
    const id = 1;
    const user = new User(
      email,
      username,
      fullName,
      password,
      phoneNumber,
      address,
      zipCode,
      id,
    );

    const loginTimes = 0;
    const sessionId = '';
    const lastSessionTime = new Date();
    const userAction = new UserAction(
      loginTimes,
      sessionId,
      lastSessionTime,
      id,
      user,
    );

    typeFunctionOrTarget();
    inverseSide(user);

    expect(userAction).toBeTruthy();
    expect(userAction.loginTimes).toBeDefined();
    expect(userAction.sessionId).toBeFalsy();
    expect(userAction.lastSessionTime).toBeDefined();
    expect(userAction.id).toBeDefined();
    expect(userAction.user).toBeDefined();
  });
});
