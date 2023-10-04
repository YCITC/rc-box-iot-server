import { ApiProperty } from '@nestjs/swagger';

export default class UserLoginDto {
  @ApiProperty({ example: '123@456.789' })
  email: string;

  @ApiProperty({ example: 'jidiizllewnicvjgiowddjoi' })
  password: string;
}
