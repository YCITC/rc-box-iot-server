import { ApiProperty } from '@nestjs/swagger';

export class RegisterChromeDto {
  @ApiProperty({ example: 'rc-box-test-12301' })
  deviceId: string;

  @ApiProperty({ example: '112.0.5615.137' })
  browserVersion: string;

  @ApiProperty({ example: 'zkMhqP6jJppzJCxCXL8aLs7ZySSb' })
  vapidPublicKey: string;

  @ApiProperty({ example: 'iuQzNfJSqB_0' })
  vapidPrivateKey: string;

  @ApiProperty({ example: 'https://fcm.googleapis.com/fcm/send/' })
  endpoint: string;

  @ApiProperty({ example: 'AAAAAlrgn' })
  keysAuth: string;

  @ApiProperty({ example: 'rPD4ThfKE6dBNi1k1_Ji4so' })
  keysP256dh: string;
}
