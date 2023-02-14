import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';

describe('AuthController', () => {
  let controller: AuthController;

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
      providers: [UsersService, AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a token object when credentials are valid', async () => {
      const user = { username: 'maria', password: 'guess' };
      const res = await controller.login(user);
      expect(res.access_token).toBeDefined();
    });
  });
});
