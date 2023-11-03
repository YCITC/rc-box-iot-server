import { ApiProperty } from '@nestjs/swagger';

export default class UserChangePasswrodDto {
  @ApiProperty({ example: 'icvjgiowddjoijidiizllewn' })
  newPassword: string;

  @ApiProperty({ example: 'icvjgiowddjoijidiizllewn' })
  confirmNewPassword: string;

  @ApiProperty({ example: 'abcdefghi' })
  oldPassword?: string;
}
