import * as https from 'https';
import * as jwt from 'jsonwebtoken';

import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

import EmailService from '../email/email.service';
import User from '../users/entity/user.entity';
import UsersService from '../users/users.service';
import AuthController from './auth.controller';
import AuthService from './auth.service';
import TokenType from './enum/token-type';

jest.mock('https', () => ({
  get: jest.fn(),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let usersService: UsersService;
  let authService: AuthService;
  let emailService: EmailService;
  let jwtService: JwtService;
  let token: string;

  const rawUser = {
    email: '1@2.3',
    username: 'Tester',
    fullName: 'Tester Jest',
    password: '$2b$05$nY4W0gDU8AD10MSoVITnSe3rxzu4GlZpnQMbXyqtZoG0BTe9yXkKW',
    phoneNumber: '0900123456',
    address: 'No. 7, Section 5, Xinyi Road, Xinyi District · Taipei · Taiwan',
    zipCode: '110',
  };
  const testUser = new User(
    rawUser.email,
    rawUser.username,
    rawUser.fullName,
    rawUser.password,
    rawUser.phoneNumber,
    rawUser.address,
    rawUser.zipCode,
    1,
  );
  let currentUser = null;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'iOjE2NzU2OTUyOTQsImV4cC.',
          signOptions: {
            expiresIn: '1d',
            issuer: 'YesseeCity',
          },
        }),
        PassportModule,
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn().mockImplementation((dto) => {
              if (!dto.password) {
                throw new UnauthorizedException('email or password incorrect');
              }
              return Promise.resolve(testUser);
            }),
            createToken: jest.fn().mockResolvedValue({ token: 'tokenString' }),
            changePassword: jest.fn().mockResolvedValue(true),
            resetPassword: jest.fn().mockResolvedValue(true),
            verifyToken: jest.fn().mockResolvedValue(true),
          },
        },
        UsersService,
        {
          provide: EmailService,
          useValue: {
            sendResetPasswordEmail: (to) => {
              return Promise.resolve({
                messageId: 'abc123',
                resopnse: 'OK',
                accepted: [to],
              });
            },
            sendVerificationEmail: (obj) => {
              return Promise.resolve({
                messageId: 'abc123',
                resopnse: 'OK',
                accepted: [obj.mailTo],
              });
            },
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn().mockResolvedValue(testUser),
            save: (user) => {
              const newUserInfo = { ...user };
              newUserInfo.createdTime = new Date();
              if (user?.isEmailVerified === undefined) {
                newUserInfo.isEmailVerified = false;
              }
              return Promise.resolve(newUserInfo);
            },
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT.SECRET') return 'iOjE2NzU2OTUyOTQsImV4cC.';
              if (key === 'JWT.ISSUER') return 'YesseeCity';
              if (key === 'JWT.EXPIRATION_TIME') return '30d';
              if (key === 'SERVER_HOSTNAME') return 'localhost:3000';
              if (key === 'common.VERIFY_SUCCESS_URL') return 'localhost:3000';
              return null;
            }),
          },
        },
        JwtService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    emailService = module.get<EmailService>(EmailService);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should get user avatarUrl as null', async () => {
      (https.get as jest.Mock).mockImplementation((url, callback) => {
        const mockResponse = {
          statusCode: 404,
        };
        callback(mockResponse as any); // Casting to 'any' for simplicity
      });
      const user = { email: '1@2.3', password: '1234' };
      const res = await controller.login(user);
      expect(res.user.avatarUrl).toBeNull();
    });
    it('should return user and token when credentials are valid', async () => {
      (https.get as jest.Mock).mockImplementation((url, callback) => {
        const mockResponse = {
          statusCode: 200,
        };
        callback(mockResponse as any); // Casting to 'any' for simplicity
      });
      const user = { email: '1@2.3', password: '1234' };
      const res = await controller.login(user);
      currentUser = res;
      expect(res.access_token).toBeDefined();
      expect(res.user.avatarUrl).toBeTruthy();
    });
  });
  describe('changePassword', () => {
    const dto = {
      oldPassword: '1234',
      newPassword: 'AbcEfg123%$',
      confirmNewPassword: 'AbcEfg123%$',
    };
    it('should return true', async () => {
      const res = await controller.changePassword(
        { user: { id: testUser.id } },
        dto,
      );
      expect(res).toEqual(true);
    });
  });
  describe('requestResetPassword', () => {
    it('should return true', async () => {
      const res = await controller.requestResetPassword(rawUser.email);
      expect(res).toBeTruthy();
    });
    it('should throw error', async () => {
      (https.get as jest.Mock).mockImplementation((url, callback) => {
        const mockResponse = {
          statusCode: 200,
        };
        callback(mockResponse as any); // Casting to 'any' for simplicity
      });
      const user = { email: '1@2.3', password: '' };
      await expect(controller.login(user)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });
  describe('resetPassword', () => {
    const dto = {
      newPassword: 'AbcEfg123%$',
      confirmNewPassword: 'AbcEfg123%$',
    };
    it('should return true', async () => {
      const jwtPayload = {
        id: testUser.id,
        username: testUser.username,
        type: TokenType.RESET_PASSWORD,
      };
      const res = await controller.resetPassword({ user: jwtPayload }, dto);
      expect(res).toEqual(true);
    });
    it('should throw error', async () => {
      const jwtPayload = {
        id: testUser.id,
        username: testUser.username,
        type: TokenType.AUTH,
      };

      await expect(
        controller.resetPassword({ user: jwtPayload }, dto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
  describe('createUser', () => {
    it('should send a mail and return true', async () => {
      const result = await controller.createUser(rawUser);
      expect(result).toBeTruthy();
    });

    it('should rejects BadRequestException Require password', async () => {
      const process = controller.createUser({ ...rawUser, password: '' });
      await expect(process).rejects.toThrow(
        new BadRequestException('Require password'),
      );
    });

    it('should throw BadRequestException Require email', async () => {
      const process = controller.createUser({ ...rawUser, email: '' });
      await expect(process).rejects.toThrow(
        new BadRequestException('Require email'),
      );
    });
    it('should throw BadRequestException Require username', async () => {
      const process = controller.createUser({ ...rawUser, username: '' });
      await expect(process).rejects.toThrowError(
        new BadRequestException('Require username'),
      );
    });
    it('should retrun false', async () => {
      jest.spyOn(emailService, 'sendVerificationEmail').mockResolvedValue({
        accepted: [],
      });
      const result = await controller.createUser(rawUser);
      expect(result).toBeFalsy();
    });
  });
  describe('emailVerify', () => {
    // it('should redirect to other page', async () => {
    //   let redirectUrl: string;
    //   const mockResponse = {
    //     redirect: jest.fn((url) => {
    //       // console.log('redirect success url: ', url);
    //       redirectUrl = url;
    //     }),
    //     status: jest.fn().mockReturnValue({ json: jest.fn() }),
    //   };

    //   const spy = jest.spyOn(mockResponse, 'redirect');
    //   await controller.emailVerify(token, mockResponse);
    //   expect(mockResponse.redirect).toBeCalled();
    //   expect(mockResponse.redirect).toHaveBeenCalledWith('localhost:3000');
    //   expect(spy).toHaveBeenCalledWith('localhost:3000');
    //   expect(redirectUrl).toBe('localhost:3000');
    // });
    it('should retrun true', async () => {
      jest.spyOn(usersService, 'emailVerify').mockResolvedValue(true);
      const result = await controller.emailVerify(token);
      expect(result).toBeTruthy();
    });
    it('should rejects BadRequestException TokenExpiredError', async () => {
      jest.spyOn(authService, 'verifyToken').mockImplementation(() => {
        throw new jwt.TokenExpiredError('', new Date());
      });
      const process = controller.emailVerify('fack-token-string');
      await expect(process).rejects.toThrow(
        new BadRequestException('TokenExpiredError'),
      );
    });
    it('should rejects BadRequestException JsonWebTokenError', async () => {
      jest.spyOn(authService, 'verifyToken').mockImplementation(() => {
        throw new jwt.JsonWebTokenError('');
      });
      const process = controller.emailVerify('fack-token-string');
      await expect(process).rejects.toThrow(
        new BadRequestException('JsonWebTokenError'),
      );
    });
    it('should rejects BadRequestException', async () => {
      jest.spyOn(authService, 'verifyToken').mockImplementation(() => {
        throw new Error('Unkow Error');
      });
      const process = controller.emailVerify('fack-token-string');
      await expect(process).rejects.toThrow(BadRequestException);
    });
  });
  describe('emailResend', () => {
    it('should retrun true', async () => {
      token = await controller.emailResend(rawUser.email);
      expect(token).toBeTruthy();
    });
    it('should rejects BadRequestException Cannot find user', async () => {
      jest.spyOn(usersService, 'findOneByMail').mockImplementation(() => {
        throw new BadRequestException('Cannot find user');
      });
      const process = controller.emailResend(rawUser.email);
      await expect(process).rejects.toThrow(
        new BadRequestException('Cannot find user'),
      );
    });
    it('should rejects BadRequestException EmailVerified', async () => {
      jest
        .spyOn(usersService, 'findOneByMail')
        .mockResolvedValueOnce({ ...testUser, isEmailVerified: true });
      const process = controller.emailResend(rawUser.email);
      await expect(process).rejects.toThrow(
        new BadRequestException('EmailVerified'),
      );
    });
    it('should get message "send mail failed"', async () => {
      jest.spyOn(emailService, 'sendVerificationEmail').mockResolvedValueOnce({
        accepted: [],
      });
      const response = await controller.emailResend(rawUser.email);
      expect(response).toBe('send mail failed');
    });
    it('should rejects BadRequestException', async () => {
      jest.spyOn(authService, 'verifyToken').mockImplementation(() => {
        throw new Error('Unkow Error');
      });
      const process = controller.emailVerify('fack-token-string');
      await expect(process).rejects.toThrow(BadRequestException);
    });
  });
  describe('profile', () => {
    it('should send a mail and return user profile without password and isEmailVerified', async () => {
      const user = await controller.getProfile({ user: { id: testUser.id } });
      expect(true).toBeTruthy();
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('email');
    });
  });
  describe('updateProfile', () => {
    it('should change user profile and return user', async () => {
      const payload = { id: testUser.id, username: testUser.username };
      token = jwtService.sign(payload);
      const returnUser = await controller.updateProfile({
        ...currentUser,
        zipCode: '70445',
      });
      expect(returnUser.zipCode).toBe('70445');
    });
  });
  describe('updateToken', () => {
    it('should return a token', async () => {
      const newToekn = await controller.updateToken({
        user: { id: 1, username: 'testUser' },
      });
      expect(newToekn).toBeDefined();
    });
  });
});
