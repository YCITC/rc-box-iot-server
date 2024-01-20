import { registerAs } from '@nestjs/config';

export default registerAs('REDIS', () => ({
  config: {
    host: 'localhost',
    port: 6379,
  },
}));
