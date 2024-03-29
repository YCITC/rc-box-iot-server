import UserAction from './user-action.entity';
import User, { inverseSide, typeFunctionOrTarget } from './user.entity';

describe('User Entity', () => {
  it('should careate user with userAction', () => {
    const email = '1@2.3';
    const username = 'Tester';
    const fullName = 'Tester Jest';
    const password = 'weNeedPassword';
    const phoneNumber = '0900123456';
    const address =
      'No. 7, Section 5, Xinyi Road, Xinyi District · Taipei · Taiwan';
    const zipCode = '110';
    const id = 1;
    const loginTimes = 0;
    const sessionId = '';
    const lastSessionTime = new Date();
    const userAction = new UserAction(loginTimes, sessionId, lastSessionTime);

    const user = new User(
      email,
      username,
      fullName,
      password,
      phoneNumber,
      address,
      zipCode,
      id,
      userAction,
    );

    typeFunctionOrTarget();
    inverseSide(userAction);

    expect(user).toBeTruthy();
    expect(user.createdTime).toBeDefined();
    expect(user.isEmailVerified).toBeFalsy();
    expect(user.email).toBeDefined();
    expect(user.username).toBeDefined();
    expect(user.password).toBeDefined();
    expect(user.phoneNumber).toBeDefined();
    expect(user.address).toBeDefined();
    expect(user.zipCode).toBeDefined();
    expect(user.userAction).toBeDefined();
  });
});
