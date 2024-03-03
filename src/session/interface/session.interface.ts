import { ApiProperty } from '@nestjs/swagger';
import ActiveSession from '../eneity/active-session.entity';

export default class AverageActiveSession {
  @ApiProperty({
    example: [
      { count: 19, day: '2024-01-28', id: 162 },
      { count: 21, day: '2024-01-27', id: 161 },
    ],
  })
  activeHistory: ActiveSession[];

  @ApiProperty({ example: 7 })
  days: number;

  @ApiProperty({ example: 12 })
  average: number;
}
