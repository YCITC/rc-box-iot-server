import { Controller, Body, Param } from '@nestjs/common';
import { Get, Put, Delete } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserRegisterDto } from './dto/user.register.dto';
import { User } from './entity/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('findByMail/:email')
  @ApiResponse({
    status: 200,
    description: 'User found.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Cannot find user.' })
  findByMail(@Param('email') email: string): Promise<User> {
    return this.usersService.findOneByMail(email);
  }

  @Get('findById/:id')
  @ApiResponse({
    status: 200,
    description: 'User found.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Cannot find user.' })
  findByUid(@Param('id') id: number): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Put('create')
  @ApiOperation({ summary: 'Create User with out email verify ' })
  @ApiResponse({
    status: 200,
    description: 'Create successed.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Email [useremail] exist' })
  addOne(@Body() userDto: UserRegisterDto): Promise<User> {
    return this.usersService.addOne(userDto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete User with id ' })
  @ApiResponse({
    status: 200,
    description: 'Delete successed.',
  })
  @ApiResponse({ status: 400, description: 'User not found' })
  deleteOne(@Param('id') id: number): Promise<any> {
    return this.usersService.deleteOne(id);
  }
}
