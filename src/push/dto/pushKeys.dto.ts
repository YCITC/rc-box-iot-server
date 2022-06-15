export class PushKeysDto {
  deviceId: string;
  browser: string;
  vapidPublicKey: string;
  vapidPrivateKey: string;
  endpoint: string;
  keysAuth: string;
  keysP256dh: string;
}
