import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import UserLoginDto from './user.login.dto';

export default class UserRegisterDto extends PartialType(UserLoginDto) {
  @ApiProperty({ example: 'Tid Huang' })
  fullName: string;

  @ApiProperty({ example: 'Tid' })
  username: string; // or displayName

  @ApiProperty({ example: '0900123456' })
  phoneNumber: string;

  @ApiProperty({
    example: 'No. 7, Section 5, Xinyi Road, Xinyi District, Taiepi, Taiwan',
  })
  address: string;

  @ApiProperty({ example: '110' })
  zipCode: string;

  isEmailVerified?: boolean;
}
