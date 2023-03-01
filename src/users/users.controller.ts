import { BadRequestException, Controller } from '@nestjs/common';
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

  @Get('findByUid/:id')
  findByUid(@Param('id') id: number): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Put('create')
  async addOne(@Body() userDto: UserRegisterDto): Promise<User> {
    try {
      const user = await this.usersService.addOne(userDto);
      return Promise.resolve(user);
    } catch (errorMsg) {
      return Promise.reject(new BadRequestException(errorMsg));
    }
  }
}
