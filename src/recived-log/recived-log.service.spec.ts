import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReceivedLog } from './entity/recived-log.entity';
import { ReceivedLogService } from './recived-log.service';

describe('ReceivedLogService', () => {
  let service: ReceivedLogService;
  let repo: Repository<ReceivedLog>;

  const oneLog = new ReceivedLog('jest test 1');
  const logArray = [
    oneLog,
    new ReceivedLog('jest test 1'),
    new ReceivedLog('jest test 1'),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceivedLogService,
        {
          provide: getRepositoryToken(ReceivedLog),
          useValue: {
            find: jest.fn().mockResolvedValue(logArray),
            save: jest.fn().mockReturnValue(oneLog),
            delete: jest.fn().mockResolvedValue({ affected: 3 }),
          },
        },
      ],
    }).compile();

    service = module.get<ReceivedLogService>(ReceivedLogService);
    repo = module.get<Repository<ReceivedLog>>(getRepositoryToken(ReceivedLog));
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of logs', async () => {
      const repoSpy = jest.spyOn(repo, 'find');
      const logs = await service.getAll();
      expect(logs).toEqual(logArray);
      expect(repoSpy).toBeCalledWith({
        order: {
          id: 'DESC',
        },
      });
    });
  });

  describe('findByDeviceId', () => {
    it('should return an array of logs', async () => {
      const repoSpy = jest.spyOn(repo, 'find');
      const logs = await service.findByDeviceId('test_device_id');
      expect(logs).toEqual(logArray);
      expect(repoSpy).toBeCalledWith({
        order: {
          id: 'DESC',
        },
        where: { deviceId: 'test_device_id' },
      });
    });
  });

  describe('create', () => {
    it('should return an log', async () => {
      const rawLog = {
        id: 'uuid',
        time: new Date(),
        deviceId: 'jest test 1',
      };
      const log = await service.create(rawLog);
      expect(log).toMatchObject(oneLog);
      expect(log.deviceId).toEqual(log.deviceId);
    });
  });

  describe('delete', () => {
    it('should delete logs', async () => {
      const response = await service.clean('test_device_id');
      expect(response).toBeTruthy();
    });
  });
});
