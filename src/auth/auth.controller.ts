import * as crypto from 'crypto';
import * as https from 'https';

import { Controller, UseGuards, BadRequestException } from '@nestjs/common';
import { Get, Post, Put, Patch } from '@nestjs/common';
import { Req, Body, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { User } from '../users/entity/user.entity';
import { UserRegisterDto } from '../users/dto/user.register.dto';
import { UserLoginDto } from '../users/dto/user.login.dto';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { UserProfileDto } from 'src/users/dto/user.profile.dto';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  @Post('login')
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
  async login(@Body() userLoginDto: UserLoginDto): Promise<any | undefined> {
    try {
      const user = await this.authService.validateUser(userLoginDto);
      const token = this.authService.createToken(user);

      return new Promise((resolve) => {
        const hash = crypto.createHash('md5').update(user.email).digest('hex');
        https.get(
          'https://www.gravatar.com/avatar/' + hash + '?d=404',
          (res) => {
            if (res.statusCode === 404) {
              user.avatarUrl = null;
              resolve({
                access_token: token,
                user: user,
              });
            } else {
              user.avatarUrl = 'https://www.gravatar.com/avatar/' + hash;
              resolve({
                access_token: token,
                user: user,
              });
            }
          },
        );
      });
    } catch (error) {
      console.log('[auth/login][error]\n', error);
      return Promise.reject(error);
    }
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
    if (req.user?.id) {
      const user = await this.usersService.findOneById(req.user.id);
      delete user.password;
      delete user.isEmailVerified;
      return Promise.resolve(user);
    }

    throw new BadRequestException('Lost user information');
  }

  @Post('updateProfile')
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
      console.log('aaaaa');
      const user = this.usersService.updateProfile(userProfileDto);
      return Promise.resolve(user);
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
  async updateToken(@Req() req): Promise<any | undefined> {
    const token = this.authService.createToken(req.user);
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
    try {
      const user = await this.usersService.addOne(userDto);
      const token = this.authService.createOneDayToken(user);
      const url =
        'https://' +
        this.configService.get('SERVER_HOSTNAME') +
        '/email-verify?t=' +
        token;

      const result = await this.emailService.sendVerificationEmail(
        user.email,
        url,
      );
      if (result.accepted.length > 0)
        return Promise.resolve({ ...user, token });
      return Promise.resolve(false);
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
      await this.usersService.emailVerify(userInfo.id);
      return Promise.resolve(true);
    } catch (error) {
      if (error.name == 'TokenExpiredError') {
        // const url =
        //   this.configService.get('common.VERIFY_FAILED_URL') +
        //   '?error=TokenExpiredError';
        // return res.redirect(url);
        return Promise.reject(new BadRequestException('TokenExpiredError'));
      }

      if (error.name == 'JsonWebTokenError') {
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

  @Get('emailResend/:email')
  @ApiResponse({
    status: 200,
    description: 'I will search user with email address and send varify email',
  })
  async emailResend(@Param('email') email: string): Promise<string> {
    try {
      const user = await this.usersService.findOneByMail(email);
      if (!user)
        return Promise.reject(new BadRequestException(`Could not find user`));
      if (user.isEmailVerified) {
        return Promise.reject(new BadRequestException(`EmailVerified`));
      }
      const token = this.authService.createOneDayToken(user);
      const url =
        'https://' +
        this.configService.get('SERVER_HOSTNAME') +
        '/email-verify?t=' +
        token;

      const result = await this.emailService.sendVerificationEmail(
        user.email,
        url,
      );
      if (result.accepted.length > 0) return Promise.resolve(token);
    } catch (error) {
      if (error.name == 'TokenExpiredError') {
        return Promise.reject(new BadRequestException('TokenExpiredError'));
      }

      if (error.name == 'JsonWebTokenError') {
        error.message = 'JsonWebTokenError';
        return Promise.reject(new BadRequestException('TokenExpiredError'));
      }

      return Promise.reject(new BadRequestException(error.message));
    }
  }
}
