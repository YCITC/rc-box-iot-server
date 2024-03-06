import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';

import PushModule from '../src/push/push.module';
import ChromeClient from '../src/push/entity/chrome.client.entity';
import IOSClient from '../src/push/entity/ios.client.entity';
import DevicesModule from '../src/devices/devices.module';
import DevicesService from '../src/devices/devices.service';
import Device from '../src/devices/entities/device.entity';
import JwtStrategy from '../src/auth/strategies/jwt.strategy';
import commonConfig from '../src/config/common.config';
import dbConfig from '../src/config/db.config';
import jwtConfig from '../src/config/jwt.config';
import rawUser from './raw-user';
import TokenType from '../src/auth/enum/token-type';
import ReceivedLog from '../src/recived-log/entity/recived-log.entity';
import RolesEnum from '../src/common/enum';

const pushControllerE2ETest = () => {
  let app: INestApplication;
  let chromeClientRepo: Repository<ChromeClient>;
  let IOSClientRepo: Repository<IOSClient>;
  let jwtService: JwtService;
  let accessToken: string;

  const deviceId1 = 'rc-box-test-12301';
  const registerChromeDto = {
    deviceId: deviceId1,
    browserVersion: '1.0.0',
    vapidPublicKey: 'vapidPublicKey_01',
    vapidPrivateKey: 'vapidPrivateKey_01',
    endpoint: 'endpoint_01',
    keysAuth: 'keysAuth_01',
    keysP256dh: 'keysP256dh_01',
  };
  const registerIPhoneDto = {
    deviceId: deviceId1,
    iPhoneToken: 'tokenString',
    appId: 'yesseecity.rc-box-app-dev',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PushModule,
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
              entities: [Device, ReceivedLog, ChromeClient, IOSClient],
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

    chromeClientRepo = app.get<Repository<ChromeClient>>(
      getRepositoryToken(ChromeClient),
    );
    IOSClientRepo = app.get<Repository<IOSClient>>(
      getRepositoryToken(IOSClient),
    );
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

  it('/push/genChromeVAPID/ (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/push/genChromeVAPID')
      .send({
        deviceId: deviceId1,
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response.body).toHaveProperty('publicKey');
    expect(response.body).toHaveProperty('privateKey');
  });

  it('/push/subscribe/chrome (POST)', async () => {
    await chromeClientRepo.clear();
    const response = await request(app.getHttpServer())
      .post('/push/subscribe/chrome')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(registerChromeDto)
      .expect(201);
    const client = response.body;
    expect(client).toBeDefined();
    expect(client.deviceId).toBe(deviceId1);
    expect(client).toHaveProperty('id');
    expect(client).toHaveProperty('subscribeTime');
  });

  it('/push/subscribe/ios (POST)', async () => {
    await IOSClientRepo.clear();
    const response = await request(app.getHttpServer())
      .post('/push/subscribe/ios')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(registerIPhoneDto)
      .expect(201);
    const client = response.body;
    expect(client).toBeDefined();
    expect(client.deviceId).toBe(deviceId1);
    expect(client).toHaveProperty('id');
    expect(client).toHaveProperty('subscribeTime');
  });

  it('/push/send/:deviceId (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/push/send/${deviceId1}`)
      .send(registerIPhoneDto)
      .expect(200);
    const clients = response.body;
    expect(clients).toBeDefined();
    expect(clients.length).toBeGreaterThan(0);
  });
};

describe.skip('PushController (e2e)', pushControllerE2ETest);

export default pushControllerE2ETest;
