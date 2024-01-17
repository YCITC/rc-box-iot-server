import { ApiProperty } from '@nestjs/swagger';

export default class AverageActiveSession {
  @ApiProperty({ example: 7 })
  days: number;

  @ApiProperty({ example: 12 })
  average: number;
}
