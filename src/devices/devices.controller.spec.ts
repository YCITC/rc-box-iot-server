import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import DevicesController from './devices.controller';
import DevicesService from './devices.service';
import Device from './entities/device.entity';

describe('DevicesController', () => {
  let controller: DevicesController;
  let mockDeviceInDB: Device;
  let myDevice: Device;
  const ownerUserId = 1;
  const rawDevices = {
    deviceId: 'rc-box-test-12301',
    ownerUserId,
    alias: 'tsutaya',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [
        DevicesService,
        {
          provide: getRepositoryToken(Device),
          useValue: {
            save: (device) => {
              mockDeviceInDB = { ...device, id: 1, createdTime: new Date() };
              return Promise.resolve(mockDeviceInDB);
            },
            update: jest.fn().mockImplementation((deviceId, obj) => {
              mockDeviceInDB.alias = obj.alias;
              return Promise.resolve({ raw: [], affected: 1 });
            }),
            findOneBy: jest.fn().mockResolvedValue(mockDeviceInDB),
            find: jest.fn().mockResolvedValue([mockDeviceInDB]),
            delete: jest.fn().mockResolvedValue({ raw: [], affected: 1 }),
          },
        },
      ],
    }).compile();

    controller = module.get<DevicesController>(DevicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('bind', () => {
    it('should return a devices', async () => {
      myDevice = await controller.bind(rawDevices, {
        user: {
          username: 'user',
          id: 1,
        },
      });
      expect(myDevice).toBeDefined();
      expect(myDevice.createdTime).toBeDefined();
    });
  });

  describe('bind again', () => {
    it('should throw a BadRequestException', async () => {
      const errorText = `The device [${rawDevices.deviceId}] has already been bound`;
      const badRequestException = new BadRequestException(errorText);
      const user1Process = controller.bind(rawDevices, {
        user: {
          username: 'user',
          id: 1,
        },
      });
      await expect(user1Process).rejects.toThrowError(badRequestException);
    });

    it('should throw a BadRequestException', async () => {
      const errorText = `Can not bind other user's device`;
      const unauthorizedException = new UnauthorizedException(errorText);
      const user2Process = controller.bind(rawDevices, {
        user: {
          username: 'user2',
          id: 2,
        },
      });
      await expect(user2Process).rejects.toThrowError(unauthorizedException);
    });
  });

  describe('update', () => {
    it('should return a devices', async () => {
      const newDevice = { ...myDevice, alias: 'lounge' };
      const device = await controller.update(newDevice, {
        user: {
          username: 'user',
          id: 1,
        },
      });
      expect(device.alias).toBe('lounge');
    });
  });

  describe('findAllByUser', () => {
    it("Should return all of user's devices", async () => {
      const deviceArray = await controller.findAllWithUserId({
        user: { username: 'user', id: 1 },
      });
      expect(Array.isArray(deviceArray)).toBe(true);
    });
  });

  describe('unbind', () => {
    it('should return a devices', async () => {
      const result = await controller.unbind(myDevice.deviceId, {
        user: {
          username: 'user',
          id: 1,
        },
      });
      expect(result).toBe(true);
    });
  });
});
