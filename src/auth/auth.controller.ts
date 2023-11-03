import * as console from 'console';
import * as crypto from 'crypto';
import * as https from 'https';

import { Controller, UseGuards } from '@nestjs/common';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { HttpCode, Get, Post, Put } from '@nestjs/common';
import { Req, Body, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import JwtAuthGuard from './guards/jwt-auth.guard';
import AuthService from './auth.service';
import User from '../users/entity/user.entity';
import UserRegisterDto from '../users/dto/user.register.dto';
import UserProfileDto from '../users/dto/user.profile.dto';
import UserChangePasswrodDto from '../users/dto/user.change-password.dto';
import UserLoginDto from '../users/dto/user.login.dto';
import UsersService from '../users/users.service';
import EmailService from '../email/email.service';
import GoogleOauthGuard from './guards/google-auth.guard';
import TokenType from './enum/token-type';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export default class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'User found.',
    schema: {
      example: { access_token: 'token_string' },
      type: 'object',
      properties: { access_token: { type: 'string' } },
    },
  })
  @ApiResponse({
    status: 400,
    description: '[auth/login][error].....',
  })
  async login(
    @Body() userLoginDto: UserLoginDto,
  ): Promise<{ user: User; access_token: string }> {
    try {
      const user = await this.authService.validateUser(userLoginDto);
      const token = this.authService.createToken({
        id: user.id,
        username: user.username,
        type: TokenType.SINGIN,
      });

      return await new Promise((resolve) => {
        const hash = crypto.createHash('md5').update(user.email).digest('hex');
        https.get(`https://www.gravatar.com/avatar/${hash}?d=404`, (res) => {
          if (res.statusCode === 404) {
            user.avatarUrl = null;
            resolve({
              access_token: token,
              user,
            });
          } else {
            user.avatarUrl = `https://www.gravatar.com/avatar/${hash}`;
            resolve({
              access_token: token,
              user,
            });
          }
        });
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  @Post('changePassword')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Reset password successed.',
  })
  @ApiResponse({
    status: 400,
    description: `"New password verification failed" or "Password policy failed"`,
  })
  @ApiResponse({
    status: 401,
    description: `Old password incorrect`,
  })
  changePassword(
    @Req() req,
    @Body() dto: UserChangePasswrodDto,
  ): Promise<boolean> {
    return this.authService.changePassword(req.user.id, dto);
  }

  @Get('requestResetPassword/:email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send an email to reset password' })
  async requestResetPassword(@Param('email') email: string): Promise<boolean> {
    const user = await this.usersService.findOneByMail(email);
    const token = this.authService.createOneDayToken({
      id: user.id,
      username: user.username,
      type: TokenType.RESET_PASSWORD,
    });
    const url = `https://${this.configService.get(
      'SERVER_HOSTNAME',
    )}/reset-password?t=${token}`;
    const result = await this.emailService.sendResetPasswordEmail(
      user.email,
      url,
    );
    if (result.accepted.length > 0) return Promise.resolve(true);
    return Promise.resolve(false);
  }

  @Post('resetPassword')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reset password' })
  resetPassword(
    @Req() req,
    @Body() dto: UserChangePasswrodDto,
  ): Promise<boolean> {
    if (req.user.type !== TokenType.RESET_PASSWORD)
      throw new UnauthorizedException('Token incorrect');
    return this.authService.resetPassword(req.user.id, dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user profile without password',
  })
  @ApiResponse({
    status: 400,
    description: 'Lost user information',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async getProfile(@Req() req): Promise<User> {
    const user = await this.usersService.findOneById(req.user.id);
    delete user.password;
    delete user.isEmailVerified;
    return Promise.resolve(user);
  }

  @Post('updateProfile')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated',
    schema: {
      example: true,
      type: 'boolean',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async updateProfile(@Body() userProfileDto: UserProfileDto): Promise<User> {
    try {
      const user = this.usersService.updateProfile(userProfileDto);
      return await Promise.resolve(user);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Get('updateToken')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Update jwtToken, Front-End must add "Authorization: Bearer ****token*****" in header',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async updateToken(@Req() req): Promise<{ access_token: string }> {
    const token = this.authService.createToken({
      id: req.user.id,
      username: req.user.username,
      type: TokenType.SINGIN,
    });
    return Promise.resolve({
      access_token: token,
    });
  }

  @Put('createUser')
  @ApiResponse({
    status: 200,
    description:
      "User created. Don't forget to check your mailbox to receive a verification email.",
    schema: {
      example: true,
      type: 'boolean',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email [ ****** ] exist',
  })
  async createUser(@Body() userDto: UserRegisterDto): Promise<User | any> {
    if (userDto.password === undefined) {
      throw new BadRequestException('Require password');
    }
    if (userDto.email === undefined) {
      throw new BadRequestException('Require email');
    }
    if (userDto.username === undefined) {
      throw new BadRequestException('Require username');
    }

    try {
      const user = await this.usersService.addOne(userDto);
      const token = this.authService.createOneDayToken({
        id: user.id,
        username: user.username,
        type: TokenType.EMAIL_VERIFY,
      });
      const url = `https://${this.configService.get(
        'SERVER_HOSTNAME',
      )}/email-verify?t=${token}`;

      const result = await this.emailService.sendVerificationEmail(
        user.email,
        url,
      );
      if (result.accepted.length > 0)
        return await Promise.resolve({ ...user, token });
      return await Promise.resolve(false);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Get('emailVerify/:token')
  @ApiResponse({
    status: 200,
    description:
      'If the token has no errors, it will return ture, if the token has error, redirect the user to other page.',
  })
  async emailVerify(@Param('token') token: string): Promise<boolean> {
    try {
      const userInfo = await this.authService.verifyToken(token);
      return await this.usersService.emailVerify(userInfo.id);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // const url =
        //   this.configService.get('common.VERIFY_FAILED_URL') +
        //   '?error=TokenExpiredError';
        // return res.redirect(url);
        return Promise.reject(new BadRequestException('TokenExpiredError'));
      }

      if (error.name === 'JsonWebTokenError') {
        // const url =
        //   this.configService.get('common.VERIFY_FAILED_URL') +
        //   '?error=JsonWebTokenError';
        // return res.redirect(url);
        error.message = 'JsonWebTokenError';
        return Promise.reject(new BadRequestException('TokenExpiredError'));
      }

      // console.log(error);
      // return res.status(400).json({
      //   statusCode: 400,
      //   error: 'Bad Request',
      //   message: error.message,
      // });
      return Promise.reject(new BadRequestException(error.message));
    }
  }

  // TODO: Maybe it can be changed to request different types of emails
  @Get('emailResend/:email')
  @ApiResponse({
    status: 200,
    description: 'I will search user with email address and send varify email',
  })
  async emailResend(@Param('email') email: string): Promise<string> {
    try {
      const user = await this.usersService.findOneByMail(email);
      if (!user)
        return await Promise.reject(
          new BadRequestException(`Could not find user`),
        );
      if (user.isEmailVerified) {
        return await Promise.reject(new BadRequestException(`EmailVerified`));
      }
      const token = this.authService.createOneDayToken({
        id: user.id,
        username: user.username,
        type: TokenType.EMAIL_VERIFY,
      });
      const url =
        'https://' +
        `this.configService.get('SERVER_HOSTNAME')/email-verify?t=${token}`;

      const result = await this.emailService.sendVerificationEmail(
        user.email,
        url,
      );
      if (result.accepted.length > 0) return await Promise.resolve(token);
      return await Promise.resolve('send mail failed');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return Promise.reject(new BadRequestException('TokenExpiredError'));
      }

      if (error.name === 'JsonWebTokenError') {
        error.message = 'JsonWebTokenError';
        return Promise.reject(new BadRequestException('TokenExpiredError'));
      }

      return Promise.reject(new BadRequestException(error.message));
    }
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async googleOAuth(): Promise<boolean> {
    return Promise.resolve(true);
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleOAuthCallback(@Req() req): Promise<boolean> {
    console.log(req.user);
    return Promise.resolve(true);
  }
}
