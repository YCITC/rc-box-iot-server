import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Request } from '@nestjs/common';

import { UsersDto } from 'src/users/dto/users.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async gotTokenById(@Body() userDto: UsersDto): Promise<any | undefined> {
    try {
      const user = await this.authService.validateUser(userDto);
      console.log('user: ', user);
      return this.authService.createToken(user);
    } catch (error) {
      console.log('------- error -------\n', error);
      return Promise.reject(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    console.log('profile: ', req);
    return req.user;
  }
}
