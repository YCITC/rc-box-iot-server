import { BadRequestException, Controller, UseGuards } from '@nestjs/common';
import { Body, Param, Get, Post, Put } from '@nestjs/common';
import { Request } from '@nestjs/common';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRegisterDto } from '../users/dto/user.register.dto';
import { UserLoginDto } from '../users/dto/user.login.dto';
import { User } from '../users/entity/user.entity';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto): Promise<any | undefined> {
    try {
      const user = await this.authService.validateUser(userLoginDto);
      return this.authService.createToken(user);
    } catch (error) {
      console.log('[auth/login][error]\n', error);
      return Promise.reject(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // console.log('profile: ', req);
    return req.user;
  }

  @Put('create')
  async addOne(@Body() userDto: UserRegisterDto): Promise<User> {
    try {
      const user = await this.usersService.addOne(userDto);
      const tokenInfo = await this.authService.createToken(user);

      const url =
        'http://' +
        this.configService.get('SERVER_HOSTNAME') +
        '/emailConfirmation?token=' +
        tokenInfo.access_token;

      console.log(url);
      // this.emailService.sendVerificationEmail(user.email, url);

      return Promise.resolve(user);
    } catch (errorMsg) {
      return Promise.reject(new BadRequestException(errorMsg));
    }
  }
}
