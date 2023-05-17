import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';

import { ReceivedLog } from './entity/recived-log.entity';
import { ReceivedLogDto } from './dto/recived-log.dto';
import { ReceivedLogService } from './recived-log.service';
import { ReceivedLogController } from './recived-log.controller';
import { DevicesService } from '../devices/devices.service';
import { Device } from '../devices/entities/device.entity';

describe('ReceivedLog Controller', () => {
  let controller: ReceivedLogController;
  const ownerUserId = 1;
  const deviceId1 = 'rc-box-test-12301';
  const deviceId2 = 'rc-box-test-53104';
  const dbDevices = [
    {
      deviceId: deviceId1,
      ownerUserId: ownerUserId,
      alias: '',
    },
    {
      deviceId: deviceId2,
      ownerUserId: ownerUserId,
      alias: '',
    },
  ];

  const oneLog = new ReceivedLog(deviceId1, new Date(), 1);
  const dbLogs = [
    oneLog,
    new ReceivedLog(deviceId1, new Date(), 2),
    new ReceivedLog(deviceId2, new Date(), 3),
    new ReceivedLog(deviceId1, new Date(), 4),
    new ReceivedLog(deviceId2, new Date(), 5),
  ];

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ReceivedLogController],
      providers: [
        ReceivedLogService,
        {
          provide: getRepositoryToken(ReceivedLog),
          useValue: {
            save: jest.fn().mockImplementation((dto: ReceivedLogDto) => {
              const log = new ReceivedLog(dto.deviceId, new Date(), 6);
              dbLogs.push(log);
              return Promise.resolve(log);
            }),
            find: jest.fn().mockImplementation((params: object) => {
              if (params['where'] && params['where']['deviceId']) {
                const deviceId = params['where']['deviceId'];
                const logs = dbLogs.filter((log) => log.deviceId == deviceId);
                return Promise.resolve(logs);
              } else {
                return Promise.resolve(dbLogs);
              }
            }),
            delete: jest.fn().mockResolvedValue({ affected: 3 }),
          },
        },
        DevicesService,
        {
          provide: getRepositoryToken(Device),
          useValue: {
            find: jest.fn().mockResolvedValue(dbDevices),
            findOneBy: (obj) => {
              const foundDevice = dbDevices.find(
                (device) => device.deviceId == obj.deviceId,
              );
              return Promise.resolve(foundDevice);
            },
          },
        },
      ],
    }).compile();

    controller = app.get<ReceivedLogController>(ReceivedLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // describe('getAll', () => {
  //   it('should return an array of logs', async () => {
  //     await expect(controller.getAll()).resolves.toEqual(dbLogs);
  //   });
  // });

  describe('create', () => {
    it('should return a log', async () => {
      const dto: ReceivedLogDto = {
        deviceId: deviceId1,
      };
      const log = await controller.add(dto);
      expect(log.deviceId).toEqual(dto.deviceId);
      expect(log.time).toBeInstanceOf(Date);
      expect(typeof log.id).toBe('number');
    });

    const dto: ReceivedLogDto = { deviceId: '' };
    const errorText = 'deviceId length cannot be zero';
    const exceptionObj = new BadRequestException(errorText);

    it('shold throw BadRequestException', async () => {
      try {
        await controller.add(dto);
      } catch (error) {
        // expect(error).toBeInstanceOf(BadRequestException);
        expect(error).toEqual(
          new BadRequestException('deviceId length cannot be zero'),
        );
      }
    });

    it('reject-test', () => {
      expect(Promise.reject(exceptionObj)).rejects.toThrow(exceptionObj);
    });

    it('try catch', async () => {
      try {
        await controller.add(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error).toEqual(exceptionObj);
      }
    });

    it('toThrow Exception', async () => {
      await expect(controller.add(dto)).rejects.toThrowError(
        BadRequestException,
      );
    });
    it('toThrow Exception Object', async () => {
      await expect(controller.add(dto)).rejects.toThrow(exceptionObj);
    });
    it('toThrow Exception text', async () => {
      await expect(controller.add(dto)).rejects.toThrow(errorText);
    });
    it('toThrowError Exception', async () => {
      await expect(controller.add(dto)).rejects.toThrowError(
        BadRequestException,
      );
    });
    it('toThrowError Exception Object', async () => {
      await expect(controller.add(dto)).rejects.toThrowError(exceptionObj);
    });
    it('toThrowError text', async () => {
      await expect(controller.add(dto)).rejects.toThrowError(errorText);
    });
  });

  describe('findByDeviceId', () => {
    it('should return logs with deviceId "' + deviceId1 + '"', async () => {
      const returnLogs = dbLogs.filter((log) => {
        return log.deviceId == deviceId1;
      });
      const logs = await controller.findByDeviceId(deviceId1, {
        user: {
          username: 'user',
          id: '1',
        },
      });
      expect(logs).toEqual(returnLogs);
    });
  });

  describe('getAllByUser', () => {
    it('should return logs with userId "' + ownerUserId + '"', async () => {
      const returnLogs = dbLogs.sort((a, b) => b.id - a.id);
      const logs = await controller.getAllByUser({
        user: {
          username: 'user',
          id: ownerUserId,
        },
      });
      expect(logs).toEqual(returnLogs);
    });
  });

  describe('clean', () => {
    it('should clean logs', async () => {
      const response = await controller.clean(deviceId1, {
        user: {
          username: 'user',
          id: '1',
        },
      });
      expect(response).toBeTruthy();
    });
  });
});
