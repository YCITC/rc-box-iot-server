import { registerAs } from '@nestjs/config';

export default registerAs('google', () => ({
  // For Chrome Web Push Notification (Firebase Cloud Messaging)
  WebPush: {
    APIKey: 'AIzaSyCUsr3UrfNUNoP7KYR5h5eoKt0DUjQjBDQ',
  },
  OAuth2: {
    clientID: 'google_oauth2_client_id',
    clientSecret: 'google_oauth2_client_id',
    callbackRoute: '/oauth-redirect',
  },
}));
