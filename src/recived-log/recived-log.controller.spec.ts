import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';

import { ReceivedLog } from './entity/recived-log.entity';
import { ReceivedLogDto } from './dto/recived-log.dto';
import { ReceivedLogService } from './recived-log.service';
import { ReceivedLogController } from './recived-log.controller';

describe('ReceivedLog Controller', () => {
  let service: ReceivedLogService;
  let controller: ReceivedLogController;

  const oneLog = new ReceivedLog('jest test 1', new Date(), 1);
  const allLogs = [
    oneLog,
    new ReceivedLog('jest test 2'),
    new ReceivedLog('jest test 2'),
    new ReceivedLog('jest test 3'),
    new ReceivedLog('jest test 3'),
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
              const log = new ReceivedLog(dto.deviceId, new Date(), 10);
              return Promise.resolve(log);
            }),
            find: jest.fn().mockImplementation((params: object) => {
              if (params['where'] && params['where']['deviceId']) {
                const deviceId = params['where']['deviceId'];
                const logs = allLogs.map((log) => log.deviceId == deviceId);
                return Promise.resolve(logs);
              } else {
                return Promise.resolve(allLogs);
              }
            }),
          },
        },
      ],
    }).compile();

    service = app.get<ReceivedLogService>(ReceivedLogService);
    controller = app.get<ReceivedLogController>(ReceivedLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of logs', async () => {
      const logs = await service.getAll();
      expect(logs).toEqual(allLogs);
      await expect(controller.getAll()).resolves.toEqual(allLogs);
    });
  });

  describe('findByDeviceId', () => {
    it('should return logs with deviceId "jest test 2"', async () => {
      const deviceId = 'jest test 2';
      const logs = allLogs.map((log) => log.deviceId == deviceId);
      await expect(controller.findByDeviceId(deviceId)).resolves.toEqual(logs);
    });
  });

  describe('create', () => {
    it('should return a log', async () => {
      const dto: ReceivedLogDto = {
        deviceId: 'jest test 4',
      };
      const log = await controller.create(dto);
      expect(log.deviceId).toEqual(dto.deviceId);
      expect(log.time).toBeInstanceOf(Date);
      expect(typeof log.id).toBe('number');
    });

    const dto: ReceivedLogDto = { deviceId: '' };
    const errorText = 'deviceId length cannot be zero';
    const exceptionObj = new BadRequestException(errorText);

    it('shold throw BadRequestException', async () => {
      try {
        await controller.create(dto);
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
        await controller.create(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error).toEqual(exceptionObj);
      }
    });

    it('toThrow Exception', async () => {
      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });
    it('toThrow Exception Object', async () => {
      await expect(controller.create(dto)).rejects.toThrow(exceptionObj);
    });
    it('toThrow Exception text', async () => {
      await expect(controller.create(dto)).rejects.toThrow(errorText);
    });
    it('toThrowError Exception', async () => {
      await expect(controller.create(dto)).rejects.toThrowError(
        BadRequestException,
      );
    });
    it('toThrowError Exception Object', async () => {
      await expect(controller.create(dto)).rejects.toThrowError(exceptionObj);
    });
    it('toThrowError text', async () => {
      await expect(controller.create(dto)).rejects.toThrowError(errorText);
    });
  });
});
