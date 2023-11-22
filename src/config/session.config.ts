import { registerAs } from '@nestjs/config';

export default registerAs('SESSION', () => ({
  secret: 'your-secret-key',
  resave: false,
  rolling: true,
  saveUninitialized: false,
  name: 'tid',
  cookie: {
    // maxAge: 60000, // 1分
    maxAge: 5184000000, // 60天
    sameSite: true,
    httpOnly: true,
  },
}));
