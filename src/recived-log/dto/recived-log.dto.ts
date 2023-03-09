import { ApiProperty } from '@nestjs/swagger';

export class ReceivedLogDto {
  @ApiProperty({ example: 'rc-box-JixujH$zf' })
  deviceId: string;
}
