import { Controller, UseGuards } from '@nestjs/common';
import { Body, Param, Get, Post, Put } from '@nestjs/common';
import { Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { User } from '../users/entity/user.entity';
import { UserRegisterDto } from '../users/dto/user.register.dto';
import { UserLoginDto } from '../users/dto/user.login.dto';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

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
      const token = this.authService.createToken(user);
      return Promise.resolve({
        access_token: token,
      });
    } catch (error) {
      console.log('[auth/login][error]\n', error);
      return Promise.reject(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    // console.log('profile: ', req);
    return req.user;
  }

  @Put('createUser')
  async addOne(@Body() userDto: UserRegisterDto): Promise<User | any> {
    const user = await this.usersService.addOne(userDto);
    const token = this.authService.createOneDayToken(user);
    const url =
      'http://' +
      this.configService.get('SERVER_HOSTNAME') +
      '/auth/emailVerify/' +
      token;

    const result = await this.emailService.sendVerificationEmail(
      user.email,
      url,
    );
    if (result.accepted.length > 0) return Promise.resolve(true);
    return Promise.resolve(false);
  }

  @Get('emailVerify/:token')
  async emailVerify(@Param('token') token: string, @Res() res) {
    try {
      const userInfo = await this.authService.decodeToken(token);
      await this.usersService.emailVerify(userInfo.id);
      // return res.status(200).json();
      return res.redirect(this.configService.get('VERIFY_SUCCESS_URL'));
    } catch (error) {
      if (error.name == 'TokenExpiredError') {
        const url =
          this.configService.get('VERIFY_FAILED_URL') +
          '?error=TokenExpiredError';
        return res.redirect(url);
      }

      if (error.name == 'JsonWebTokenError') {
        const url =
          this.configService.get('VERIFY_FAILED_URL') +
          '?error=JsonWebTokenError';
        return res.redirect(url);
      }

      console.log(error);
      return res.status(400).json({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message,
      });
    }
  }
}
