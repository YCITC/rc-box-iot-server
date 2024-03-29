import { ApiProperty } from '@nestjs/swagger';

export default class UserResetPasswordDto {
  @ApiProperty({ example: 'icvjgiowddjoijidiizllewn' })
  newPassword: string;

  @ApiProperty({ example: 'icvjgiowddjoijidiizllewn' })
  confirmNewPassword: string;
}
