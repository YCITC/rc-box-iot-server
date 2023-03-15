import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { UsersModule } from '../src/users/users.module';
import { User } from '../src/users/entity/user.entity';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userId: number;
  const userEmail = 'test@example.com';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        ConfigModule.forRoot({
          isGlobal: false,
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
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/users/create/ (POST)', async () => {
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
      .get('/users/findByMail/' + userEmail)
      .expect(200)
      .then((response) => {
        expect(response.body.email).toBe(userEmail);
      });
  });

  it('/users/findById/:userId (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/findById/' + userId)
      .expect(200);
    expect(response.body.id).toEqual(userId);
  });

  it('/users/delete/:userId (GET)', async () => {
    const response = await request(app.getHttpServer())
      .delete('/users/delete/' + userId)
      .expect(200);
    expect(response.body.statusCode).toBe(200);
  });
});
