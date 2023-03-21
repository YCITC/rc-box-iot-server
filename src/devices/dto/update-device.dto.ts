import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { BindDeviceDto } from './bind-device.dto';

export class UpdateDeviceDto extends PartialType(BindDeviceDto) {
  @ApiProperty({ example: 1 })
  id: number;
}
