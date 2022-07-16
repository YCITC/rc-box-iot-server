export class PushRegisterDto {
  // general
  deviceId: string;
  clientType: string;

  // for browser
  browser: string;
  vapidPublicKey: string;
  vapidPrivateKey: string;
  endpoint: string;
  keysAuth: string;
  keysP256dh: string;

  // for iPhone
  iPhoneToken: string;
  appId: string;
}
