export interface PushClientInterface {
  uid: number;
  deviceId: string;
  clientType: string;
  state: boolean;
  message: string;
  vapidPublicKey: string;
  iPhoneToken: string;
}
