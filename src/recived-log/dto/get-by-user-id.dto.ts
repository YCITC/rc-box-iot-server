import { ApiProperty } from '@nestjs/swagger';

export default class GetByUserIdDto {
  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: { page: 1, limit: 10 } })
  paginateOptions: {
    page: number;
    limit: number;
  };
}
