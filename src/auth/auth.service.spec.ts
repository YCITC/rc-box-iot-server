import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import User from '../users/entity/user.entity';
import UsersService from '../users/users.service';
import AuthService from './auth.service';
import TokenType from './enum/token-type';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let token: string;
  const rawUser = {
    email: '1@2.3',
    name: 'Tester',
    fullName: 'Tester Jest',
    password: '$2b$05$nY4W0gDU8AD10MSoVITnSe3rxzu4GlZpnQMbXyqtZoG0BTe9yXkKW',
    phoneNumber: '0900123456',
    address: 'No. 7, Section 5, Xinyi Road, Xinyi District · Taipei · Taiwan',
    zipCode: '110',
  };

  beforeEach(async () => {
    const testUser = new User(
      rawUser.email,
      rawUser.name,
      rawUser.fullName,
      rawUser.password,
      rawUser.phoneNumber,
      rawUser.address,
      rawUser.zipCode,
    );
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
      providers: [
        AuthService,
        JwtService,
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
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn().mockResolvedValue(testUser),
            save: jest.fn().mockResolvedValue(testUser),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a token object when credentials are valid', async () => {
      const user = { email: '1@2.3', password: '1234' };
      const res = await authService.validateUser(user);
      expect(res.email).toBeDefined();
    });

    it('should return null when credentials are invalid', async () => {
      const user = { email: 'zz', password: 'zzz' };
      await expect(authService.validateUser(user)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });
  describe('changePassword', () => {
    const dto = {
      oldPassword: '1234',
      newPassword: 'Abc123%*dga',
      confirmNewPassword: 'Abc123%*dga',
    };
    it('should return true', async () => {
      const res = await authService.changePassword(1, dto);
      expect(res).toEqual(true);
    });
    it('should throw Exceptions', async () => {
      await expect(
        authService.changePassword(1, {
          ...dto,
          newPassword: 'Abcdef12',
        }),
      ).rejects.toThrowError(new BadRequestException('Password policy failed'));
      await expect(
        authService.changePassword(1, {
          ...dto,
          oldPassword: '0000',
        }),
      ).rejects.toThrowError(
        new UnauthorizedException('Old password incorrect'),
      );
      await expect(
        authService.changePassword(1, {
          ...dto,
          oldPassword: '1234',
          newPassword: 'Abcdef12%$',
          confirmNewPassword: 'Abcdef1234',
        }),
      ).rejects.toThrowError(
        new BadRequestException('New password verification failed'),
      );
    });
  });
  describe('resetPassword', () => {
    const dto = {
      newPassword: 'Abc123%*dga',
      confirmNewPassword: 'Abc123%*dga',
    };
    it('should return true', async () => {
      const res = await authService.resetPassword(1, dto);
      expect(res).toEqual(true);
    });
    it('should throw Exceptions', async () => {
      await expect(
        authService.changePassword(1, {
          ...dto,
          newPassword: 'Abcdef12',
        }),
      ).rejects.toThrowError(new BadRequestException('Password policy failed'));
      await expect(
        authService.changePassword(1, {
          ...dto,
          newPassword: 'Abcdef12%$',
          confirmNewPassword: 'Abcdef1234',
        }),
      ).rejects.toThrowError(
        new BadRequestException('New password verification failed'),
      );
    });
  });
  describe('createToken', () => {
    it('should return JWT object when credentials are valid', async () => {
      const res = await authService.createToken({
        username: 'john',
        id: 1,
        type: TokenType.AUTH,
      });
      expect(res).toBeDefined();
    });
  });
  describe('verifyToken', () => {
    it('should return JWT object when credentials are valid', async () => {
      const payload = await authService.verifyToken(token);
      expect(payload.id).toBeDefined();
      expect(payload.username).toBeDefined();
      expect(payload.iat).toBeDefined();
    });
  });
});
