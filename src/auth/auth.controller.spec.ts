import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entity/user.entity';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';

describe('AuthController', () => {
  let controller: AuthController;
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
            save: jest.fn(),
            findOneBy: jest.fn().mockResolvedValue(testUser),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') {
                return 'iOjE2NzU2OTUyOTQsImV4cC.';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
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
});
