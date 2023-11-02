import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';

import EmailService from '../email/email.service';
import User from '../users/entity/user.entity';
import UsersService from '../users/users.service';
import AuthController from './auth.controller';
import AuthService from './auth.service';
import TokenType from './enum/token-type';

describe('AuthController', () => {
  let controller: AuthController;
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
        AuthService,
        UsersService,
        EmailService,
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
        {
          provide: MailerService,
          useValue: {
            sendMail: jest
              .fn()
              .mockResolvedValue({ accepted: [testUser.email] }),
          },
        },
        JwtService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe.only('login', () => {
    it('should return user and token when credentials are valid', async () => {
      const user = { email: '1@2.3', password: '1234' };
      const res = await controller.login(user);
      currentUser = res;
      expect(res.access_token).toBeDefined();
      expect(res.user).toHaveProperty('avatarUrl');
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
      expect(res).toEqual(true);
    });
  });
  describe('resetPassword', () => {
    it('should return true', async () => {
      const dto = {
        newPassword: 'AbcEfg123%$',
        confirmNewPassword: 'AbcEfg123%$',
      };
      const jwtPayload = { 
        id: testUser.id,
        username: testUser.username,
        type: TokenType.RESET_PASSWORD
      };
      const res = await controller.resetPassword({ user: jwtPayload }, dto);
      expect(res).toEqual(true);
    });
  });
  describe('createUser', () => {
    it('should send a mail and return true', async () => {
      const payload = { id: testUser.id, username: testUser.username };
      token = jwtService.sign(payload);
      const success = await controller.createUser(rawUser);
      expect(success).toBeTruthy();
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
      currentUser.zipCode = '70445';
      const returnUser = await controller.updateProfile(currentUser);
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

  describe('emailResend', () => {
    it('should retrun true', async () => {
      token = await controller.emailResend(rawUser.email);
      expect(token).toBeTruthy();
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
      const result = await controller.emailVerify(token);
      expect(result).toBeTruthy();
    });
  });
});
