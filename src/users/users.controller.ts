import { Controller } from '@nestjs/common';
import { Body, Get, Param, Put } from '@nestjs/common';
import { UserRegisterDto } from './dto/user.register.dto';
import { User } from './entity/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('findByMail/:email')
  findByMail(@Param('email') email: string): Promise<User> {
    return this.usersService.findOneByMail(email);
  }

  @Get('findById/:id')
  findByUid(@Param('id') id: number): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Put('create')
  addOne(@Body() userDto: UserRegisterDto): Promise<User> {
    return this.usersService.addOne(userDto);
  }
}
