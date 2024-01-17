import { registerAs } from '@nestjs/config';

export default registerAs('REDIS', () => ({
  config: {
    host: 'localhost',
    port: 6379,
    // password:
    //   'a83160255b7c0dc35e29406fca3a021d243ed6c2c944789235b9372126ae0a8a',
  },
}));
