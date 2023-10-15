export default interface PushClientInterface {
  id: number;
  deviceId: string;
  clientType: string;
  state: boolean;
  message: string;
  vapidPublicKey: string;
  iPhoneToken: string;
}
