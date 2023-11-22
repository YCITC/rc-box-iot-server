import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';

import ReceivedLog from '../src/recived-log/entity/recived-log.entity';
import ReceivedLogModule from '../src/recived-log/recived-log.module';
import DevicesModule from '../src/devices/devices.module';
import DevicesService from '../src/devices/devices.service';
import Device from '../src/devices/entities/device.entity';
import JwtStrategy from '../src/auth/strategies/jwt.strategy';
import commonConfig from '../src/config/common.config';
import dbConfig from '../src/config/db.config';
import jwtConfig from '../src/config/jwt.config';
import rawUser from './raw-user';
import TokenType from '../src/auth/enum/token-type';

describe('ReceivedLogController (e2e)', () => {
  let app: INestApplication;
  let repo: Repository<ReceivedLog>;
  let jwtService: JwtService;
  let accessToken: string;
  const deviceId1 = 'rc-box-test-12301';
  const deviceId2 = 'rc-box-test-53104';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ReceivedLogModule,
        DevicesModule,
        ConfigModule.forRoot({
          isGlobal: false,
          envFilePath: ['.development.env'],
        }),
        ConfigModule.forFeature(commonConfig),
        ConfigModule.forFeature(dbConfig),
        ConfigModule.forFeature(jwtConfig),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => {
            const dbInfo = {
              ...configService.get('DB'),
              host: configService.get('DB_HOST'),
              entities: [Device, ReceivedLog],
              synchronize: true,
            };
            return dbInfo;
          },
          inject: [ConfigService],
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            const obj = {
              secret: configService.get('JWT.SECRET'),
              signOptions: {
                expiresIn: `${configService.get('JWT.EXPIRATION_TIME')}`,
                issuer: configService.get('JWT.ISSUER'),
              },
            };
            return obj;
          },
        }),
      ],
      providers: [DevicesService, JwtService, JwtStrategy],
    }).compile();

    app = moduleFixture.createNestApplication();
    repo = app.get<Repository<ReceivedLog>>(getRepositoryToken(ReceivedLog));
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();

    const signOptions = {
      secret: app.get<ConfigService>(ConfigService).get('JWT.SECRET'),
    };
    const payload = {
      id: 1,
      username: rawUser.username,
      type: TokenType.SINGIN,
    };
    accessToken = jwtService.sign(payload, signOptions);
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

  //* Don't use this API on production environment.
  // it('/log/getAll/ (GET)', async () => {
  //   const response = await request(app.getHttpServer())
  //     .get('/log/getAll/')
  //     .expect(200);
  //   expect(response.body[0].deviceId).toBe(deviceId2);
  //   expect(response.body[1].deviceId).toBe(deviceId1);
  // });

  it('/log/get/:deviceId (GET)', async () => {
    const response1 = await request(app.getHttpServer())
      .get(`/log/get/${deviceId1}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response1.body[0].deviceId).toBe(deviceId1);
    const response2 = await request(app.getHttpServer())
      .get(`/log/get/${deviceId2}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response2.body[0].deviceId).toBe(deviceId2);
  });

  it('/log/getAllByUser (GET)', async () => {
    const response1 = await request(app.getHttpServer())
      .get('/log/getAllByUser')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response1.body[0].deviceId).toBe(deviceId2);
    expect(response1.body[1].deviceId).toBe(deviceId1);
  });

  it('/log/clean/ (DELETE)', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/log/clean/${deviceId1}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response.body.statusCode).toEqual(200);

    await repo.clear();
  });
});
