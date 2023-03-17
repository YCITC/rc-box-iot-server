import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Response } from '@nestjs/common';

import { EmailService } from '../email/email.service';
import { User } from '../users/entity/user.entity';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: {
            expiresIn: '1d',
            issuer: jwtConstants.issuer,
          },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            save: jest.fn().mockResolvedValue(testUser),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            findOneBy: jest.fn().mockResolvedValue(testUser),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'iOjE2NzU2OTUyOTQsImV4cC.';
              if (key === 'JWT_ISSUER') return 'YesseeCity';
              if (key === 'SERVER_HOSTNAME') return 'localhost:3000';
              if (key === 'VERIFY_SUCCESS_URL') return 'localhost:3000';
              return null;
            }),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendVerificationEmail: jest
              .fn()
              .mockResolvedValue({ accepted: [testUser.email] }),
          },
        },
        JwtService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a token object when credentials are valid', async () => {
      const user = { email: '1@2.3', password: '1234' };
      const res = await controller.login(user);
      expect(res.access_token).toBeDefined();
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
  describe('emailVerify', () => {
    it('should redirect to other page', async () => {
      // TODO
      let redirectUrl: string;
      const mockResponse = {
        redirect: jest.fn((url) => {
          // console.log('redirect success url: ', url);
          redirectUrl = url;
        }),
        status: jest.fn().mockReturnValue({ json: jest.fn() }),
      };

      const spy = jest.spyOn(mockResponse, 'redirect');
      await controller.emailVerify(token, mockResponse);
      expect(mockResponse.redirect).toBeCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith('localhost:3000');
      expect(spy).toHaveBeenCalledWith('localhost:3000');
      expect(redirectUrl).toBe('localhost:3000');

    });
  });
});
