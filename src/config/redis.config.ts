import { registerAs } from '@nestjs/config';

export default registerAs('REDIS', () => ({
  // host: 'redis',
  port: 6379,
}));
