import { registerAs } from '@nestjs/config';

export default registerAs('DB', () => ({
  type: 'mariadb',
  port: '3306',
  username: 'root',
  password: 'localDBPassword',
  database: 'rc-box',
}));
