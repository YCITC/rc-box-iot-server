import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import User from '../users/entity/user.entity';
import UsersService from '../users/users.service';
import AuthService from './auth.service';
import TokenType from './enum/token-type';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
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
          secret: 'localJWTSecret',
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
              if (key === 'JWT.SECRET') return 'localJWTSecret';
              if (key === 'JWT.ISSUER') return 'YesseeCity';
              if (key === 'JWT.EXPIRATION_TIME') return '30d';
              if (key === 'SERVER_HOSTNAME') return 'localhost:3000';
              if (key === 'common.VERIFY_SUCCESS_URL') return 'localhost:3000';
              return null;
            }),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneByMail: jest.fn().mockResolvedValue(testUser),
            findOneById: jest.fn().mockResolvedValue(testUser),
            changePassword: jest.fn().mockResolvedValue(true),
            addOne: jest.fn().mockResolvedValue(testUser),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
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
          oldPassword: 'Abc123%*dga',
        }),
      ).rejects.toThrowError(
        new UnauthorizedException('Can not use same password'),
      );
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
        authService.resetPassword(1, {
          ...dto,
          newPassword: 'Abcdef12',
        }),
      ).rejects.toThrowError(new BadRequestException('Password policy failed'));
      await expect(
        authService.resetPassword(1, {
          ...dto,
          newPassword: 'Abcdef12%$',
          confirmNewPassword: 'Abcdef1234',
        }),
      ).rejects.toThrowError(
        new BadRequestException('New password verification failed'),
      );
    });
  });
  describe('validateGoogleUser', () => {
    it('should call usersService.findOneByMail', async () => {
      const findOneByEmailSpy = jest.spyOn(usersService, 'findOneByMail');
      await authService.validateGoogleUser({});
      expect(findOneByEmailSpy).toBeCalled();
    });
    it('should call usersService.addOne', async () => {
      jest.spyOn(usersService, 'findOneByMail').mockImplementation(() => {
        throw new Error();
      });
      const addOneSpy = jest.spyOn(usersService, 'addOne');
      await authService.validateGoogleUser({});
      expect(addOneSpy).toBeCalled();
    });
  });
  describe('createToken', () => {
    it('should return JWT object with expiresIn 1hr ', async () => {
      token = await authService.createToken({
        username: 'john',
        id: 1,
        type: TokenType.AUTH,
      });
      const payload = jwtService.verify(token);
      expect(payload.exp - payload.iat).toBe(60 * 60);
    });

    it('should return JWT object with expiresIn 12hr ', async () => {
      token = await authService.createToken({
        username: 'john',
        id: 1,
        type: TokenType.RESET_PASSWORD,
      });
      const payload = jwtService.verify(token);
      expect(payload.exp - payload.iat).toBe(12 * 60 * 60);
    });

    it('should return JWT object with expiresIn 1d ', async () => {
      token = await authService.createToken({
        username: 'john',
        id: 1,
        type: TokenType.EMAIL_VERIFY,
      });
      const payload = jwtService.verify(token);
      expect(payload.exp - payload.iat).toBe(24 * 60 * 60);
    });

    it('should return JWT object with expiresIn 60d ', async () => {
      token = await authService.createToken({
        username: 'john',
        id: 1,
        type: TokenType.REFRESH,
      });
      const payload = jwtService.verify(token);
      expect(payload.exp - payload.iat).toBe(60 * 24 * 60 * 60);
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
