import { UnauthorizedException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: {
            expiresIn: '1d',
            issuer: jwtConstants.issuer,
          },
        }),
      ],
      providers: [AuthService, JwtService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user object when credentials are valid', async () => {
      const user = { username: 'maria', password: 'guess' };
      const res = await authService.validateUser(user);
      expect(res.userId).toEqual(2);
    });

    it('should return null when credentials are invalid', async () => {
      const user = { username: 'zz', password: 'zzz' };
      await expect(authService.validateUser(user)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });

  describe('validateLogin', () => {
    it('should return JWT object when credentials are valid', async () => {
      const res = await authService.createToken({
        username: 'john',
        userId: 1,
      });
      expect(res.access_token).toBeDefined();
    });
  });
});
