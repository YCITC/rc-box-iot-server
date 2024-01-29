/* eslint-disable import/order */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import ReceivedLog from './entity/recived-log.entity';
import ReceivedLogService from './recived-log.service';
import GetByUserDto from './dto/get-by-user.dto';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));
// eslint-disable-next-line import/first
import { paginate } from 'nestjs-typeorm-paginate';

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
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              innerJoin: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
            })),
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

  describe('getByUser', () => {
    it('should call receivedLogRepository.createQueryBuilder', async () => {
      // jest.mock('nestjs-typeorm-paginate', () => ({
      //   paginate: jest.fn(),
      // }));

      const dto = {
        userId: 1,
        paginateOptions: {
          page: 1,
          limit: 10,
        },
      } as GetByUserDto;
      await service.getByUser(dto);
      expect(paginate).toBeCalled();
    });
  });

  describe('add', () => {
    it('should return an log', async () => {
      const rawLog = {
        id: 'uuid',
        time: new Date(),
        deviceId: 'jest test 1',
      };
      const log = await service.add(rawLog);
      expect(log).toMatchObject(oneLog);
      expect(log.deviceId).toEqual(log.deviceId);
    });
  });

  describe('clean', () => {
    it('should clean logs', async () => {
      const response = await service.clean('test_device_id');
      expect(response).toBeTruthy();
    });
  });
});
