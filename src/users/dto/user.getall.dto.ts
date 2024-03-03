import { ApiProperty } from '@nestjs/swagger';

export default class UserGetAllDto {
  @ApiProperty({ example: { page: 1, limit: 10 } })
  paginateOptions: {
    page: number;
    limit: number;
  };
}
