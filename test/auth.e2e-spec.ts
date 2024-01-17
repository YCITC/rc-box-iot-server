import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { Repository } from 'typeorm';
import { PassportModule } from '@nestjs/passport';

import { JwtService } from '@nestjs/jwt';
import AuthModule from '../src/auth/auth.module';
import User from '../src/users/entity/user.entity';
import UsersService from '../src/users/users.service';
import UsersModule from '../src/users/users.module';
import rawUser from './raw-user';
import commonConfig from '../src/config/common.config';
import dbConfig from '../src/config/db.config';
import UserProfileDto from '../src/users/dto/user.profile.dto';
import AuthService from '../src/auth/auth.service';
import TokenType from '../src/auth/enum/token-type';
import UserAction from '../src/users/entity/user-action.entity';
import SessionModule from '../src/session/session.module';
import ActiveSession from '../src/session/eneity/active-session.entity';
import EmailService from '../src/email/email.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userId: number;
  let emailVerifyToken: string;
  let accessToken: string;
  let reflashToken: string;
  let userRepository: Repository<User>;
  let userActionRepository: Repository<UserAction>;
  let authService: AuthService;
  let proflie = new UserProfileDto();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.development.env'],
        }),
        ConfigModule.forFeature(commonConfig),
        ConfigModule.forFeature(dbConfig),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => {
            const dbInfo = {
              ...configService.get('DB'),
              host: configService.get('DB_HOST'),
              database: 'rc-box-test',
              entities: [User, UserAction, ActiveSession],
              synchronize: true,
            };
            return dbInfo;
          },
          inject: [ConfigService],
        }),
        AuthModule,
        UsersModule,
        SessionModule,
        PassportModule,
      ],
      providers: [
        UsersService,
        JwtService,
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
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser()); // Use cookie-parser middleware

    const configService = app.get<ConfigService>(ConfigService);
    app.use(session(configService.get('SESSION')));

    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    userActionRepository = app.get<Repository<UserAction>>(
      getRepositoryToken(UserAction),
    );
    authService = app.get<AuthService>(AuthService);

    await app.init();
  });

  afterAll(async () => {
    /*
    ? 等 session.service裡面的 redis 跑完
    */
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
    await app.close();

  });

  it('/auth/createUser/ (PUT)', async () => {
    await userRepository.clear();
    await userActionRepository.clear();
    const response = await request(app.getHttpServer())
      .put('/auth/createUser')
      .send(rawUser)
      .expect(200);

    emailVerifyToken = response.body.token;
    userId = response.body.id;
    expect(response.body.token).toBeDefined();
    expect(response.body.id).toBeDefined();
  }, 6000);

  it('/auth/emailResend/ (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/auth/emailResend/${rawUser.email}`)
      .expect(200);
    expect(response.body).toBeTruthy();
  }, 6000);

  it('/auth/emailVerify/ (GET)', async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
    const response = await request(app.getHttpServer())
      .get(`/auth/emailVerify/${emailVerifyToken}`)
      .expect(200);
    expect(response.body).toBeTruthy();
  }, 6000);

  it('/auth/login/ (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...rawUser })
      .expect(200);
    const cookies = response.header['set-cookie'][0];
    reflashToken = cookies.split('; ')[0].split('=')[1] as string;
    accessToken = response.body.accessToken;
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.user).toHaveProperty('avatarUrl');
  });

  it('/auth/changePassword/ (POST)', async () => {
    const dto = {
      oldPassword: rawUser.password,
      newPassword: 'Abc123%*Eee',
      confirmNewPassword: 'Abc123%*Eee',
    };
    const response = await request(app.getHttpServer())
      .post('/auth/changePassword')
      .send(dto)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response.text).toBe('true');
  });

  it('/auth/requestResetPassword/ (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/auth/requestResetPassword/${rawUser.email}`)
      .expect(200);
    expect(response.text).toBe('true');
  });

  it('/auth/resetPassword (POST)', async () => {
    const userResetPasswrodDto = {
      newPassword: '123BBB%*dga',
      confirmNewPassword: '123BBB%*dga',
    };
    const payload = {
      id: userId,
      username: rawUser.username,
      type: TokenType.RESET_PASSWORD,
    };
    const token = authService.createToken(payload);
    const response = await request(app.getHttpServer())
      .post('/auth/resetPassword')
      .send(userResetPasswrodDto)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.text).toBe('true');
  });

  it('/auth/profile (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    proflie = { ...response.body };
    expect(response.body.id).toBe(userId);
  });

  it('/auth/updateProfile (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/updateProfile')
      .send({ ...proflie, username: 'Tim' })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response.body.id).toBe(userId);
    expect(response.body.username).toBe('Tim');
  });

  it('/auth/updateToken (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/updateToken')
      .set('Cookie', `rtk=${reflashToken};`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response.body.accessToken).toBeDefined();
  });
});
