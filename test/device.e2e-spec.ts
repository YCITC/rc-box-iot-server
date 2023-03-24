import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { Repository } from 'typeorm';

import { DevicesModule } from '../src/devices/devices.module';
import { Device } from '../src/devices/entities/device.entity';

describe('DeviceController (e2e)', () => {
  let app: INestApplication;
  let repo: Repository<Device>;
  let myDevice: Device;
  const ownerUserId = 1;
  const rawDevices = {
    deviceId: 'rc-box-v1-a12301',
    ownerUserId: ownerUserId,
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
              entities: [Device],
              synchronize: true,
            };
            return dbInfo;
          },
          inject: [ConfigService],
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    repo = app.get<Repository<Device>>(getRepositoryToken(Device));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/devices/bind (PUT)', async () => {
    const response = await request(app.getHttpServer())
      .put('/devices/bind')
      .send(rawDevices)
      .expect(200);

    myDevice = response.body;
    expect(myDevice.id).toBeDefined;
    expect(myDevice.createdTime).toBeDefined;
  });

  it('/devices/update (PATCH)', () => {
    const newDevice = { ...myDevice, alias: 'lounge' };
    return request(app.getHttpServer())
      .patch('/devices/update')
      .expect(200)
      .send(newDevice)
      .then((response) => {
        expect(response.body.alias).toBe('lounge');
      });
  });

  it('/devices/findByUser/:ownerUserId (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/devices/findByUser/' + ownerUserId)
      .expect(200);
    expect(Array.isArray(response.body)).toEqual(true);
  });

  it('/devices/unbind/:id (DELETE)', async () => {
    const response = await request(app.getHttpServer())
      .delete('/devices/unbind/' + myDevice.id)
      .expect(200);
    expect(response.text).toBe('true');
    await repo.clear();
  });
});
