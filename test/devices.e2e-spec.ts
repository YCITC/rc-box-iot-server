import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';

import DevicesModule from '../src/devices/devices.module';
import Device from '../src/devices/entities/device.entity';
import JwtStrategy from '../src/auth/strategies/jwt.strategy';
import commonConfig from '../src/config/common.config';
import dbConfig from '../src/config/db.config';
import jwtConfig from '../src/config/jwt.config';
import rawUser from './raw-user';
import TokenType from '../src/auth/enum/token-type';
import ReceivedLog from '../src/recived-log/entity/recived-log.entity';
import RolesEnum from '../src/common/enum';

const deviceControllerE2ETest = () => {
  let app: INestApplication;
  let repo: Repository<Device>;
  let jwtService: JwtService;
  let myDevice: Device;
  let accessToken: string;
  const ownerUserId = 1;
  const deviceId1 = 'rc-box-test-12301';
  const deviceId2 = 'rc-box-test-53104';
  const deviceId3 = 'rc-box-test-b2a61';
  const rawDevices = {
    deviceId: deviceId1,
    ownerUserId,
    alias: 'tsutaya',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
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
              database: 'rc-box-test',
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
      providers: [JwtService, JwtStrategy],
    }).compile();

    app = moduleFixture.createNestApplication();
    repo = app.get<Repository<Device>>(getRepositoryToken(Device));
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();

    const signOptions = {
      secret: app.get<ConfigService>(ConfigService).get('JWT.SECRET'),
    };
    const payload = {
      id: 1,
      username: rawUser.username,
      type: TokenType.AUTH,
      role: RolesEnum.USER,
    };
    accessToken = jwtService.sign(payload, signOptions);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/devices/bind (PUT)', async () => {
    await repo.clear();

    const response = await request(app.getHttpServer())
      .put('/devices/bind')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(rawDevices)
      .expect(200);
    await request(app.getHttpServer())
      .put('/devices/bind')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...rawDevices, deviceId: deviceId2, alias: '' })
      .expect(200);
    await request(app.getHttpServer())
      .put('/devices/bind')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...rawDevices, deviceId: deviceId3, alias: '' })
      .expect(200);

    myDevice = response.body;
    expect(myDevice.createdTime).toBeDefined();
  });

  it('/devices/update (PATCH)', () => {
    const newDevice = { ...myDevice, alias: 'lounge' };
    return request(app.getHttpServer())
      .patch('/devices/update')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .send(newDevice)
      .then((response) => {
        expect(response.body.alias).toBe('lounge');
      });
  });

  it('/devices/findAllByUser/ (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/devices/findAllByUser/')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Array.isArray(response.body)).toEqual(true);
  });

  it('/devices/checkDeviceWithUser/:deviceId (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/devices/checkDeviceWithUser/${rawDevices.deviceId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response.text).toBe('true');
  });

  it('/devices/unbind/:deviceId (DELETE)', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/devices/unbind/${deviceId3}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response.text).toBe('true');
  });
};

describe('DeviceController (e2e)', deviceControllerE2ETest);

export default deviceControllerE2ETest;
