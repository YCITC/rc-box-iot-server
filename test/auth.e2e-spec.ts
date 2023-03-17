import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { PassportModule } from '@nestjs/passport';

import { AuthModule } from '../src/auth/auth.module';
import { User } from '../src/users/entity/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../src/auth/constants';
import { UsersService } from '../src/users/users.service';
import { UsersModule } from '../src/users/users.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let config: ConfigService;
  let userId: number;
  let emailVerifyToken: string;
  let accessToken: string;
  let repo: Repository<User>;

  const rawUser = {
    email: 'yesseecity@icloud.com',
    password: 'jidiizllewnicvjgiowddjoi',
    fullName: 'Tid Huang',
    username: 'Tid',
    phoneNumber: '0900123456',
    address: 'No. 7, Section 5, Xinyi Road, Xinyi District, Taiepi, Taiwan',
    zipCode: '110',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        PassportModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: {
            expiresIn: '1d',
            issuer: jwtConstants.issuer,
          },
        }),
        ConfigModule.forRoot({
          envFilePath: ['.development.env'],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => {
            const dbInfo = {
              type: configService.get('DB_type'),
              host: configService.get('DB_host'),
              port: configService.get('DB_port'),
              username: configService.get('DB_username'),
              password: configService.get('DB_password'),
              database: 'rc-box-test',
              // entities: ['dist/**/*.entity{.ts,.js}'],
              entities: [User],
              synchronize: false,
            };
            return dbInfo;
          },
          inject: [ConfigService],
        }),
      ],
      providers: [
        UsersService,
        // 
        JwtService,
      ],
    }).compile();

    config = moduleFixture.get<ConfigService>(ConfigService);
    app = moduleFixture.createNestApplication();
    repo = app.get<Repository<User>>(getRepositoryToken(User));

    await app.init();
  });
  afterEach(async () => {
    await app.close();
  });

  it('/auth/createUser/ (PUT)', async () => {
    const response = await request(app.getHttpServer())
      .put('/auth/createUser')
      .send(rawUser)
      .expect(200);

    emailVerifyToken = response.body.token;
    userId = response.body.id;
    expect(response.body.token).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(true).toEqual(true);
  });

  it('/auth/emailVerify/ (GET)', async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await request(app.getHttpServer())
      .get('/auth/emailVerify/' + emailVerifyToken)
      .expect(302);
    expect(response.header.location).toEqual(config.get('VERIFY_SUCCESS_URL'));
  });

  it('/auth/login/ (post)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...rawUser })
      .expect(201);
    accessToken = response.body.access_token;
    expect(response.body.access_token).toBeDefined();
  });

  it('/auth/profile (Get)', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(200);
    expect(response.body.id).toBe(userId);
    await repo.clear();
  });
});
