import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
  @ApiProperty({ example: '123@456.789' })
  email: string;

  @ApiProperty({ example: 'jidiizllewnicvjgiowddjoi' })
  password: string;
}
