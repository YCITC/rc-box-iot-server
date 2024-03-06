import { ApiProperty } from '@nestjs/swagger';

export default class UserChangePasswrodDto {
  @ApiProperty({ required: true, example: 'icvjgiowddjoijidiizllewn' })
  newPassword: string;

  @ApiProperty({ required: true, example: 'icvjgiowddjoijidiizllewn' })
  confirmNewPassword: string;

  @ApiProperty({ required: true, example: 'abcdefghi' })
  oldPassword?: string;
}
