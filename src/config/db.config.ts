import { registerAs } from '@nestjs/config';

export default registerAs('DB', () => ({
  type: 'mariadb',
  host: '34.80.129.4',
  port: '3306',
  username: 'root',
  password: '70ikXKSWxDkbyIcEBhGcFbmz',
  database: 'rc-box',
}));
