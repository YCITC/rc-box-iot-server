import { ApiProperty } from '@nestjs/swagger';

export class BindDeviceDto {
  @ApiProperty({ example: 'rc-box-v1-a12301' })
  deviceId: string;

  @ApiProperty({ example: 1 })
  ownerUserId: number;

  @ApiProperty({ example: 'my box' })
  alias: string;
}
