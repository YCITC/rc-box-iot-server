import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

import ReceivedLog from './entity/recived-log.entity';
import ReceivedLogDto from './dto/recived-log.dto';
import ReceivedLogService from './recived-log.service';
import ReceivedLogController from './recived-log.controller';
import DevicesService from '../devices/devices.service';
import Device from '../devices/entities/device.entity';
import User from '../users/entity/user.entity';
import TokenType from '../auth/enum/token-type';

describe('ReceivedLog Controller', () => {
  let controller: ReceivedLogController;
  let devicesService: DevicesService;
  let receiveService: ReceivedLogService;

  const ownerUserId = 1;
  const deviceId1 = 'rc-box-test-12301';
  const deviceId2 = 'rc-box-test-53104';
  const dbDevices = [
    {
      deviceId: deviceId1,
      ownerUserId,
      alias: '',
    },
    {
      deviceId: deviceId2,
      ownerUserId,
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

  const rawUser = {
    email: '1@2.3',
    username: 'Tester',
    fullName: 'Tester Jest',
    password: '$2b$05$nY4W0gDU8AD10MSoVITnSe3rxzu4GlZpnQMbXyqtZoG0BTe9yXkKW',
    phoneNumber: '0900123456',
    address: 'No. 7, Section 5, Xinyi Road, Xinyi District · Taipei · Taiwan',
    zipCode: '110',
  };
  const testUser = new User(
    rawUser.email,
    rawUser.username,
    rawUser.fullName,
    rawUser.password,
    rawUser.phoneNumber,
    rawUser.address,
    rawUser.zipCode,
    1,
  );

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ReceivedLogController],
      providers: [
        {
          provide: ReceivedLogService,
          useValue: {
            add: jest.fn(),
            getByUser: jest.fn().mockResolvedValue({
              items: [
                {
                  time: '2024-01-22T08:08:58.204Z',
                  id: 3,
                  deviceId: 'rc-box-test-a12302',
                },
                {
                  time: '2024-01-22T07:52:12.188Z',
                  id: 2,
                  deviceId: 'rc-box-test-a12302',
                },
                {
                  time: '2024-01-22T07:52:11.210Z',
                  id: 1,
                  deviceId: 'rc-box-test-a12303',
                },
              ],
              meta: {
                totalItems: 45,
                itemCount: 10,
                itemsPerPage: 10,
                totalPages: 5,
                currentPage: 1,
              },
            }),
            findByDeviceId: jest.fn(),
            clean: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ReceivedLog),
          useValue: {
            save: jest.fn().mockImplementation((dto: ReceivedLogDto) => {
              const log = new ReceivedLog(dto.deviceId, new Date(), 6);
              dbLogs.push(log);
              return Promise.resolve(log);
            }),
            find: jest.fn().mockImplementation((params: any) => {
              if (params.where?.deviceId) {
                const deviceId = params.where?.deviceId;
                const logs = dbLogs.filter((log) => log.deviceId === deviceId);
                return Promise.resolve(logs);
              }
              return Promise.resolve(dbLogs);
            }),
            delete: jest.fn().mockResolvedValue({ affected: 3 }),
          },
        },
        {
          provide: DevicesService,
          useValue: {
            checkDeviceWithUser: jest.fn().mockResolvedValue(true),
            findAllWithUserId: jest.fn().mockResolvedValue(dbDevices),
          },
        },
        {
          provide: getRepositoryToken(Device),
          useValue: {
            findOneBy: (obj) => {
              const foundDevice = dbDevices.find(
                (device) => device.deviceId === obj.deviceId,
              );
              return Promise.resolve(foundDevice);
            },
          },
        },
      ],
    }).compile();

    controller = app.get<ReceivedLogController>(ReceivedLogController);
    devicesService = app.get<DevicesService>(DevicesService);
    receiveService = app.get<ReceivedLogService>(ReceivedLogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // describe('getAll', () => {
  //   it('should return an array of logs', async () => {
  //     await expect(controller.getAll()).resolves.toEqual(dbLogs);
  //   });
  // });

  describe('add', () => {
    it('should return a log', async () => {
      const spy = jest.spyOn(receiveService, 'add');
      const dto: ReceivedLogDto = {
        deviceId: deviceId1,
      };
      await controller.add(dto);
      expect(spy).toBeCalledWith(dto);
    });

    const dto: ReceivedLogDto = { deviceId: '' };
    const errorText = 'deviceId length cannot be zero';
    const exceptionObj = new BadRequestException(errorText);

    // ? Unit test example of reject exception
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
    it(`should return logs with deviceId "${deviceId1}"`, async () => {
      await controller.findByDeviceId(deviceId1, {
        user: {
          username: 'user',
          id: 1,
        },
      });
      expect(receiveService.findByDeviceId).toBeCalledWith(deviceId1);
    });
    it('should throw exception', async () => {
      jest
        .spyOn(devicesService, 'checkDeviceWithUser')
        .mockResolvedValue(false);
      await expect(
        controller.findByDeviceId(deviceId1, {
          user: {
            username: 'user2',
            id: 2,
          },
        }),
      ).rejects.toThrowError(UnauthorizedException);
    });
  });

  describe('getByUser', () => {
    const jwtPayload = {
      id: testUser.id,
      username: testUser.username,
      type: TokenType.RESET_PASSWORD,
    };
    it('should return logs', async () => {
      const page = 1;
      const limit = 101;
      await controller.getByUser({ user: jwtPayload }, page, limit);
      const response = await controller.getByUser({ user: jwtPayload });
      expect(response).toMatchObject({
        items: [
          {
            time: '2024-01-22T08:08:58.204Z',
            id: 3,
            deviceId: 'rc-box-test-a12302',
          },
          {
            time: '2024-01-22T07:52:12.188Z',
            id: 2,
            deviceId: 'rc-box-test-a12302',
          },
          {
            time: '2024-01-22T07:52:11.210Z',
            id: 1,
            deviceId: 'rc-box-test-a12303',
          },
        ],
        meta: {
          totalItems: 45,
          itemCount: 10,
          itemsPerPage: 10,
          totalPages: 5,
          currentPage: 1,
        },
      });
    });
  });

  describe('clean', () => {
    it('should clean logs', async () => {
      await controller.clean(deviceId1, {
        user: {
          username: 'user',
          id: 1,
        },
      });
      expect(receiveService.clean).toBeCalledWith(deviceId1);
    });
    it('should throw UnauthorizedException', async () => {
      jest
        .spyOn(devicesService, 'checkDeviceWithUser')
        .mockResolvedValue(false);
      await expect(
        controller.clean(deviceId1, {
          user: {
            username: 'user',
            id: 1,
          },
        }),
      ).rejects.toThrowError(UnauthorizedException);
    });
    it('should throw BadRequestException', async () => {
      jest
        .spyOn(devicesService, 'checkDeviceWithUser')
        .mockResolvedValue(false);
      await expect(
        controller.clean('', {
          user: {
            username: 'user',
            id: 1,
          },
        }),
      ).rejects.toThrowError(BadRequestException);
    });
  });
});
