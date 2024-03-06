import { ApiProperty } from '@nestjs/swagger';

export default class RegisterChromeDto {
  @ApiProperty({ required: true, example: 'rc-box-test-12301' })
  deviceId: string;

  @ApiProperty({ required: true, example: '112.0.5615.137' })
  browserVersion: string;

  @ApiProperty({ required: true, example: 'zkMhqP6jJppzJCxCXL8aLs7ZySSb' })
  vapidPublicKey: string;

  @ApiProperty({ required: true, example: 'iuQzNfJSqB_0' })
  vapidPrivateKey: string;

  @ApiProperty({
    required: true,
    example: 'https://fcm.googleapis.com/fcm/send/',
  })
  endpoint: string;

  @ApiProperty({ required: true, example: 'AAAAAlrgn' })
  keysAuth: string;

  @ApiProperty({ required: true, example: 'rPD4ThfKE6dBNi1k1_Ji4so' })
  keysP256dh: string;
}
