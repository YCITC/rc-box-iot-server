import * as console from 'console';
import * as crypto from 'crypto';
import * as https from 'https';

import { Controller, UseGuards } from '@nestjs/common';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { HttpCode, Get, Post, Put } from '@nestjs/common';
import { Req, Res, Body, Param, Session } from '@nestjs/common';
import { Request, Response } from 'express';
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
import UserInterface from '../users/interface/user.interface';
import JwtPayload from './interface/jwt-payload';

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
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: UserInterface; accessToken: string }> {
    try {
      const user = await this.authService.validateUser(userLoginDto);
      const accessToken = this.authService.createToken({
        id: user.id,
        username: user.username,
        type: TokenType.AUTH,
      });
      const refreshToken = this.authService.createToken({
        id: user.id,
        username: user.username,
        type: TokenType.REFRESH,
      });
      res.cookie('rtk', refreshToken, this.configService.get('SESSION.cookie'));

      await this.usersService.updateUserAction(user, req.sessionID);

      return await new Promise((resolve) => {
        const hash = crypto.createHash('md5').update(user.email).digest('hex');
        https.get(
          `https://www.gravatar.com/avatar/${hash}?d=404`,
          (avatarRes) => {
            if (avatarRes.statusCode === 404) {
              user.avatarUrl = null;
            } else {
              user.avatarUrl = `https://www.gravatar.com/avatar/${hash}`;
            }
            resolve({
              accessToken,
              user,
            });
          },
        );
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  @Get('logout')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Logout and clean cookie and session.',
  })
  async logout(
    @Session() session: Record<string, any>,
    @Res({ passthrough: true }) res: Response,
  ): Promise<boolean> {
    let error;
    session.destroy((err) => {
      if (err) {
        error = err;
      }
    });
    if (error) {
      return Promise.reject(error);
    }
    res.clearCookie('rtk');
    return Promise.resolve(true);
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
    const token = this.authService.createToken({
      id: user.id,
      username: user.username,
      type: TokenType.RESET_PASSWORD,
    });
    let url =
      this.configService.get('PROTOCOL') +
      this.configService.get('SERVER_HOSTNAME');
    url += `/reset-password?t=${token}`;
    await this.emailService.sendResetPasswordEmail(user.email, url);
    return Promise.resolve(true);
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
      return Promise.reject(new UnauthorizedException('Token incorrect'));
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
    const user = this.usersService.updateProfile(userProfileDto);
    return Promise.resolve(user);
  }

  @Get('updateToken')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Update jwtToken, Front-End must add "Authorization: Bearer ****token*****" in header',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async updateToken(@Req() req): Promise<{ accessToken: string }> {
    let userInfo: JwtPayload<TokenType>;
    try {
      userInfo = await this.authService.verifyToken(req.cookies.rtk);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return Promise.reject(new BadRequestException('TokenExpiredError'));
      }
      if (error.name === 'JsonWebTokenError') {
        return Promise.reject(new BadRequestException('JsonWebTokenError'));
      }
      return Promise.reject(new BadRequestException(error.message));
    }
    const token = this.authService.createToken({
      id: userInfo.id,
      username: userInfo.username,
      type: TokenType.AUTH,
    });
    return Promise.resolve({
      accessToken: token,
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
    if (!userDto.password) {
      return Promise.reject(new BadRequestException('Require password'));
    }
    if (!userDto.email) {
      return Promise.reject(new BadRequestException('Require email'));
    }
    if (!userDto.username) {
      return Promise.reject(new BadRequestException('Require username'));
    }

    const user = await this.usersService.addOne(userDto);
    const token = this.authService.createToken({
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
    if (result.accepted.length > 0) {
      return Promise.resolve({ ...user, token });
    }
    return Promise.resolve(false);
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
        return Promise.reject(new BadRequestException('TokenExpiredError'));
      }

      if (error.name === 'JsonWebTokenError') {
        // const url =
        //   this.configService.get('COMMON.VERIFY_FAILED_URL') +
        //   '?error=JsonWebTokenError';
        // return res.redirect(url);
        return Promise.reject(new BadRequestException('JsonWebTokenError'));
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
      if (user.isEmailVerified) {
        return await Promise.reject(new BadRequestException('EmailVerified'));
      }
      const token = this.authService.createToken({
        id: user.id,
        username: user.username,
        type: TokenType.EMAIL_VERIFY,
      });
      let url =
        this.configService.get('PROTOCOL') +
        this.configService.get('SERVER_HOSTNAME');
      url += `/email-verify?t=${token}`;

      const result = await this.emailService.sendVerificationEmail(
        user.email,
        url,
      );
      if (result.accepted.length > 0) return await Promise.resolve(token);
      return await Promise.resolve('send mail failed');
    } catch (error) {
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
