export interface PushClientInterface {
  id: number;
  deviceId: string;
  browserInfo: string;
  browserVersion: string;
  vapidPublicKey: string;
  vapidPrivateKey: string;
  endpoint: string;
  keysAuth: string;
  keysP256dh: string;
}
