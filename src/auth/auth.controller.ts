import { Controller, UseGuards } from '@nestjs/common';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Get, Post, Put } from '@nestjs/common';
import { Req, Res, Body, Param, Session } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import AuthService from './auth.service';
import User from '../users/entity/user.entity';
import UserRegisterDto from '../users/dto/user.register.dto';
import UserProfileDto from '../users/dto/user.profile.dto';
import UserChangePasswrodDto from '../users/dto/user.change-password.dto';
import UserResetPasswrodDto from '../users/dto/user.reset-password.dto';
import UserLoginDto from '../users/dto/user.login.dto';
import UsersService from '../users/users.service';
import EmailService from '../email/email.service';
import GoogleOauthGuard from '../common/guards/google-auth.guard';
import TokenType from './enum/token-type';
import JwtPayload from './interface/jwt-payload';
import SessionService from '../session/session.service';
import { Auth } from '../common/decorator';
import RolesEnum from '../common/enum';
import AuthLoginModel from './model/auth-login.model';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export default class AuthController {
  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private usersService: UsersService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  @ApiResponse({
    status: 200,
    description: 'User found and login.',
    type: AuthLoginModel,
  })
  @ApiResponse({
    status: 400,
    description: '[auth/login][error].....',
  })
  async login(
    @Body() userLoginDto: UserLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthLoginModel> {
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
    const oldSessionId = await this.usersService.updateUserAction(
      user,
      req.sessionID,
    );
    const avatarUrl = await this.usersService.getGravatarUrl(user.email);

    await this.sessionService.addSession(req.sessionID);
    if (oldSessionId) await this.sessionService.removeSession(oldSessionId);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl,
      },
    };
  }

  @Get('logout')
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

  @Get('requestResetPassword/:email')
  @ApiOperation({ summary: 'Send an email to reset password' })
  @ApiResponse({
    status: 200,
    description: 'The email has been sent.',
  })
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

  @Post('changePassword')
  @Auth(RolesEnum.ADMIN, RolesEnum.USER)
  @ApiOperation({ summary: 'Send an email to reset password' })
  @ApiResponse({
    status: 200,
    description: 'Reset password successed.',
  })
  @ApiBadRequestResponse({
    description: `"New password verification failed" or "Password policy failed"`,
  })
  changePassword(
    @Req() req,
    @Body() dto: UserChangePasswrodDto,
  ): Promise<boolean> {
    return this.authService.changePassword(req.user.id, dto);
  }

  @Post('resetPassword')
  @Auth(RolesEnum.ADMIN, RolesEnum.USER)
  @ApiOperation({
    summary: 'Reset password: When users forget their passwords.',
  })
  @ApiResponse({
    status: 200,
    description: 'Success.',
    schema: {
      example: true,
      type: 'boolean',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token incorrect',
  })
  resetPassword(
    @Req() req,
    @Body() dto: UserResetPasswrodDto,
  ): Promise<boolean> {
    if (req.user.type !== TokenType.RESET_PASSWORD)
      return Promise.reject(new UnauthorizedException('Token incorrect'));
    return this.authService.resetPassword(req.user.id, dto);
  }

  @Get('profile')
  @Auth(RolesEnum.ADMIN, RolesEnum.USER)
  @ApiOperation({
    summary: 'Get user profile without password',
  })
  @ApiResponse({
    status: 200,
    description: 'return User',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Lost user information',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async getProfile(
    @Req() req,
  ): Promise<Omit<User, 'password' | 'isEmailVerified'>> {
    const user = await this.usersService.findOneById(req.user.id);
    delete user.password;
    delete user.isEmailVerified;
    return Promise.resolve(user);
  }

  @Post('updateProfile')
  @Auth(RolesEnum.ADMIN, RolesEnum.USER)
  @ApiOperation({
    summary: 'Update user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async updateProfile(
    @Req() req,
    @Body() userProfileDto: UserProfileDto,
  ): Promise<User> {
    if (req.user.id !== userProfileDto.id)
      throw new UnauthorizedException("Cannot change other user's profile");
    const user = this.usersService.updateProfile(userProfileDto);
    return Promise.resolve(user);
  }

  @Get('updateToken')
  @ApiOperation({
    summary:
      'Update jwtToken, Front-End must add "Authorization: Bearer ****token*****" in header',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        accessToken: 'new-token',
      },
    },
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
  @ApiOperation({
    summary: 'Sing up',
  })
  @ApiResponse({
    status: 200,
    description:
      "User created. Don't forget to check your mailbox to receive a verification email.",
    schema: {
      example: true,
      type: 'boolean',
    },
  })
  @ApiBadRequestResponse({
    description: 'Lost something or Email [ ****** ] exist',
  })
  async createUser(@Body() userDto: UserRegisterDto): Promise<User | any> {
    if (!userDto.password) {
      throw new BadRequestException('Require password');
    }
    if (!userDto.email) {
      throw new BadRequestException('Require email');
    }
    if (!userDto.username) {
      throw new BadRequestException('Require username');
    }

    const user = await this.usersService.addOne(userDto);
    delete user.password;
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
  @ApiBadRequestResponse({
    description: 'Token error or other errors may occur.',
  })
  async emailVerify(@Param('token') token: string): Promise<boolean> {
    try {
      const userInfo = await this.authService.verifyToken(token);
      return await this.usersService.emailVerify(userInfo.id);
    } catch (error) {
      if (error.name === 'TokenExpiredError')
        throw new BadRequestException('TokenExpiredError');

      if (error.name === 'JsonWebTokenError')
        throw new BadRequestException('JsonWebTokenError');

      throw new BadRequestException(error.message);
    }
  }

  @Get('emailResend/:email')
  @ApiResponse({
    status: 200,
    description: 'It will search user with email address and send varify email',
  })
  @ApiBadRequestResponse({
    description: 'Email verified or other errors may occur.',
  })
  async emailResend(@Param('email') email: string): Promise<string> {
    try {
      const user = await this.usersService.findOneByMail(email);
      if (user.isEmailVerified) {
        throw new BadRequestException('EmailVerified');
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
  @ApiOperation({
    summary: 'Google OAuth sign in',
  })
  @UseGuards(GoogleOauthGuard)
  async googleOAuth(): Promise<boolean> {
    return Promise.resolve(true);
  }

  @Get('google/callback')
  @ApiOperation({
    summary:
      'The front end needs to pass query parameters from the Google OAuth Callback.',
  })
  @ApiResponse({
    status: 200,
    description: 'User found and login.',
    type: AuthLoginModel,
  })
  @UseGuards(GoogleOauthGuard)
  async googleOAuthCallback(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthLoginModel> {
    const { user } = req;
    if (user) {
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
      const oldSessionId = await this.usersService.updateUserAction(
        user,
        req.sessionID,
      );

      await this.sessionService.addSession(req.sessionID);
      if (oldSessionId) await this.sessionService.removeSession(oldSessionId);

      return {
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      };
    }
    throw new UnauthorizedException('Google OAuth failed');
  }
}
