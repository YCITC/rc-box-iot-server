import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { Repository } from 'typeorm';

import { ReceivedLog } from '../src/recived-log/entity/recived-log.entity';
import { ReceivedLogModule } from '../src/recived-log/recived-log.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let repo: Repository<ReceivedLog>;
  const deviceId1 = 'jest_e2e_test_1';
  const deviceId2 = 'jest_e2e_test_2';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ReceivedLogModule,
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
              entities: [ReceivedLog],
              synchronize: true,
            };
            return dbInfo;
          },
          inject: [ConfigService],
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    repo = app.get<Repository<ReceivedLog>>(getRepositoryToken(ReceivedLog));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/log/add/ (POST)', async () => {
    const response1 = await request(app.getHttpServer())
      .put('/log/add')
      .send({
        deviceId: deviceId1,
      })
      .expect(200);
    await request(app.getHttpServer())
      .put('/log/add')
      .send({
        deviceId: deviceId2,
      })
      .expect(200);

    expect(response1.body.deviceId).toEqual(deviceId1);
  });

  it('/log/get/ (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/log/get/')
      .expect(200);
    expect(response.body[0].deviceId).toBe(deviceId2);
    expect(response.body[1].deviceId).toBe(deviceId1);
  });

  it('/log/get/:deviceId (GET)', async () => {
    const response1 = await request(app.getHttpServer())
      .get('/log/get/' + deviceId1)
      .expect(200);
    expect(response1.body[0].deviceId).toBe(deviceId1);
    const response2 = await request(app.getHttpServer())
      .get('/log/get/' + deviceId2)
      .expect(200);
    expect(response2.body[0].deviceId).toBe(deviceId2);
  });

  it('/log/clean/ (DELETE)', async () => {
    const response = await request(app.getHttpServer())
      .delete('/log/clean/' + deviceId1)
      .expect(200);
    expect(response.body.statusCode).toEqual(200);

    await repo.clear();
  });
});
