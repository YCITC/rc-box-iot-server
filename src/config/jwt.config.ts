import { registerAs } from '@nestjs/config';

export default registerAs('JWT', () => ({
  SECRET: 'iOjE2NzU2OTUyOTQsImV4cC.',
  ISSUER: 'YesseeCity',
  EXPIRATION_TIME: '30d',
}));
