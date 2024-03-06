import { ApiProperty } from '@nestjs/swagger';

export default class UserResetPasswrodDto {
  @ApiProperty({ example: 'icvjgiowddjoijidiizllewn' })
  newPassword: string;

  @ApiProperty({ example: 'icvjgiowddjoijidiizllewn' })
  confirmNewPassword: string;
}
