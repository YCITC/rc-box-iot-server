import authControllerE2ETest from './auth.e2e-spec';
import deviceControllerE2ETest from './devices.e2e-spec';
import receivedLogControllerE2ETest from './recived-log.e2e-spec';
import pushControllerE2ETest from './push.e2e-spec';

describe.only('End to End test', () => {
  describe('AuthController (e2e)', authControllerE2ETest);
  describe('DeviceController (e2e)', deviceControllerE2ETest);
  describe('ReceivedLogController (e2e)', receivedLogControllerE2ETest);
  describe('PushController (e2e)', pushControllerE2ETest);
});
