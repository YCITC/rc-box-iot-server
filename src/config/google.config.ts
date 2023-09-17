import { registerAs } from '@nestjs/config';

export default registerAs('google', () => ({
  // For Chrome Web Push Notification (Firebase Cloud Messaging)
  WebPush: {
    APIKey: 'AIzaSyCUsr3UrfNUNoP7KYR5h5eoKt0DUjQjBDQ',
  },
  OAuth2: {
    clientID:
      '633936908307-atiu6bpu8iaf7uf2jk4abllm7b2s77sj.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/api/auth/google/callback',
  },
}));
