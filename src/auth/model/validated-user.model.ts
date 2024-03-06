import { ApiProperty } from '@nestjs/swagger';

export default class ValidatedUserModel {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '123@456.789' })
  email: string;

  @ApiProperty({ example: 'Tid' })
  username: string;

  @ApiProperty()
  avatarUrl?: string | null;
}
