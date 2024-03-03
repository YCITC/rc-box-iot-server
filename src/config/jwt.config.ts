import { registerAs } from '@nestjs/config';

export default registerAs('JWT', () => ({
  SECRET: 'localJWTSecret',
  ISSUER: 'YesseeCity',
  EXPIRATION_TIME: '30d',
}));
