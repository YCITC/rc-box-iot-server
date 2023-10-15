import { ApiProperty } from '@nestjs/swagger';

export default class RegisterIPhoneDto {
  //* general
  @ApiProperty({ example: 'rc-box-test-12301' })
  deviceId: string;

  //* for iPhone
  @ApiProperty({ example: 'iLCJpYXQiOjE2ODI1Nzk3NTIsImV4cCI' })
  iPhoneToken: string;

  @ApiProperty({ example: 'yesseecity.rc-box-app-dev' })
  appId: string;
}
