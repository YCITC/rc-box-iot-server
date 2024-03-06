import { ApiProperty } from '@nestjs/swagger';
import ValidatedUserModel from './validated-user.model';

export default class AuthLoginModel {
  @ApiProperty()
  user: ValidatedUserModel;

  @ApiProperty()
  accessToken: string;
}
