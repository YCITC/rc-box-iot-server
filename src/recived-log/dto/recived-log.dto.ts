import { ApiProperty } from '@nestjs/swagger';

export default class ReceivedLogDto {
  @ApiProperty({ example: 'rc-box-JixujH$zf' })
  deviceId: string;
}
