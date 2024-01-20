import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';

import commonConfig from '../src/config/common.config';
import dbConfig from '../src/config/db.config';
import UsersModule from '../src/users/users.module';
import User from '../src/users/entity/user.entity';
import UserAction from '../src/users/entity/user-action.entity';
import UsersService from '../src/users/users.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userId: number;
  let userRepostory: Repository<User>;
  let userActionRepostory: Repository<UserAction>;
  const userEmail = 'test@example.com';

  // beforeEach(async () => {
  //   const moduleFixture: TestingModule = await Test.createTestingModule({
  //     imports: [
  //       UsersModule,
  //       ConfigModule.forRoot({
  //         envFilePath: ['.development.env'],
  //       }),
  //       ConfigModule.forFeature(commonConfig),
  //       ConfigModule.forFeature(dbConfig),
  //       TypeOrmModule.forRootAsync({
  //         imports: [ConfigModule],
  //         useFactory: (configService: ConfigService) => {
  //           const dbInfo = {
  //             ...configService.get('DB'),
  //             host: configService.get('DB_HOST'),
  //             database: 'rc-box-test',
  //             entities: [User, UserAction],
  //             synchronize: true,
  //           };
  //           return dbInfo;
  //         },
  //         inject: [ConfigService],
  //       }),
  //     ],
  //     providers: [UsersService],
  //   }).compile();

  //   app = moduleFixture.createNestApplication();

  //   userRepostory = app.get<Repository<User>>(getRepositoryToken(User));
  //   userActionRepostory = app.get<Repository<UserAction>>(
  //     getRepositoryToken(UserAction),
  //   );
  //   await app.init();
  // });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
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
              entities: [User, UserAction],
              synchronize: true,
            };
            return dbInfo;
          },
          inject: [ConfigService],
        }),
      ],
      providers: [UsersService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser()); // Use cookie-parser middleware


    userRepostory = app.get<Repository<User>>(getRepositoryToken(User));
    userActionRepostory = app.get<Repository<UserAction>>(
      getRepositoryToken(UserAction),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/users/create/ (PUT)', async () => {
    await userRepostory.clear();
    await userActionRepostory.clear();

    const user = {
      email: userEmail,
      password: 'password123',
      username: 'John',
      fullName: 'John Doe',
      phoneNumber: '',
      address: '',
      zipCode: '',
    };

    const response = await request(app.getHttpServer())
      .put('/users/create')
      .send(user)
      .expect(200);

    userId = response.body.id;
    expect(response.body.email).toBe(user.email);
    expect(response.body.username).toBe(user.username);
  });

  it('/users/findByMail/:email (GET)', () => {
    return request(app.getHttpServer())
      .get(`/users/findByMail/${userEmail}`)
      .expect(200)
      .then((response) => {
        expect(response.body.email).toBe(userEmail);
      });
  });

  it.only('/user/updateUserAction/:id/:sessionId (GET)', () => {
    userId = 1;
    const sessionId = 'fake-sessionId';
    return request(app.getHttpServer())
      .get(`/users/updateUserAction/${userId}/${sessionId}`)
      .expect(200);
  });

  it('/users/findById/:userId (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/findById/${userId}`)
      .expect(200);
    expect(response.body.id).toEqual(userId);
  });

  // it('/users/delete/:userId (GET)', async () => {
  //   const response = await request(app.getHttpServer())
  //     .delete(`/users/delete/${userId}`)
  //     .expect(200);
  //   expect(response.body.statusCode).toBe(200);
  // });
});
