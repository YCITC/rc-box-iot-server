import { Controller, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { Get, Put, Delete } from '@nestjs/common';
import { Body, Param, Query, Req } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

import UserRegisterDto from './dto/user.register.dto';
import User from './entity/user.entity';
import UsersService from './users.service';
import { PaginateInterface } from '../common/interface';

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
  async findByMail(@Param('email') email: string): Promise<User> {
    const userObj = await this.usersService.findOneByMail(email);
    delete userObj.password;
    return userObj;
  }

  @Get('findById/:id')
  @ApiResponse({
    status: 200,
    description: 'User found.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Cannot find user.' })
  async findById(@Param('id') id: number): Promise<User> {
    const userObj = await this.usersService.findOneById(id);
    delete userObj.password;
    return userObj;
  }

  @Get('getAll')
  @ApiOperation({ summary: 'Get all of users' })
  @ApiResponse({
    status: 200,
    type: User,
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit,
  ): Promise<PaginateInterface<User>> {
    return this.usersService.getAll({
      paginateOptions: {
        page,
        limit: limit > 100 ? 100 : limit,
      },
    });
  }

  @Get('updateUserAction/:id')
  @ApiResponse({
    status: 200,
    description: 'Update UserAction successed.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Cannot find user.' })
  async updateUserAction(
    @Param('id') id: number,
    @Query('sessionId') sessionId: string,
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

  @Get('count')
  @ApiOperation({ summary: 'Total number of users who have signed up' })
  @ApiResponse({
    status: 200,
    description: 'I will return total users count.',
  })
  async countAllUsers(): Promise<number> {
    return this.usersService.countAllUsers();
  }
}
