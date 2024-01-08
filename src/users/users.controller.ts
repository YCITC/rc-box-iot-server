import { Controller, Body, Param } from '@nestjs/common';
import { Get, Post, Put, Delete } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import UserRegisterDto from './dto/user.register.dto';
import User from './entity/user.entity';
import UsersService from './users.service';

@ApiTags('Users')
@Controller('users')
export default class UsersController {
  constructor(private usersService: UsersService) {}

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
  async findById(@Param('id') id: number): Promise<User> {
    return this.usersService.findOneById(id);
    // return this.usersService.getUserAndUserAction(id);
  }

  @Get('updateUserAction/:id/:sessionId')
  @ApiResponse({
    status: 200,
    description: 'Update UserAction successed.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Cannot find user.' })
  async updateUserAction(
    @Param('id') id: number,
    @Param('sessionId') sessionId: string,
  ) {
    const user = await this.usersService.findOneById(id);
    this.usersService.updateUserAction(user, sessionId);
    return true;
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete User with id ' })
  @ApiResponse({
    status: 200,
    description:
      'The user has been successfully deleted using the provided ID.',
  })
  @ApiResponse({ status: 400, description: 'User not found' })
  async deleteOne(@Param('id') id: number): Promise<any> {
    await this.usersService.deleteOne(id);
    return Promise.resolve({
      statusCode: 200,
      message: `The user has been successfully deleted using the provided ID ${id}.`,
    });
  }

  @Get('users/count')
  @ApiResponse({
    status: 200,
    description: 'I will return total users count.',
  })
  async countAllUsers(): Promise<number> {
    return this.usersService.countAllUsers();
  }
}
