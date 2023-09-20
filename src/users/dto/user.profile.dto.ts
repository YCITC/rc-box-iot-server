import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: 131 })
  id: number;

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
}
