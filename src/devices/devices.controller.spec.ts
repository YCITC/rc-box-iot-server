import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { Device } from './entities/device.entity';

describe('DevicesController', () => {
  let controller: DevicesController;
  let myDevice: Device;
  const ownerUserId = 1;
  const rawDevices = {
    deviceId: 'rc-box-v1-a12301',
    ownerUserId: ownerUserId,
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
              device.id = 1;
              device.createdTime = new Date();
              return Promise.resolve(device);
            },
            update: jest.fn().mockImplementation((id, obj) => {
              if (id === myDevice.id) {
                myDevice.alias = obj.alias;
              }
              return Promise.resolve({ raw: [], affected: 1 });
            }),
            findOneBy: jest.fn().mockImplementation((obj) => {
              if (obj.id === myDevice.id) {
                return Promise.resolve(myDevice);
              }
            }),
            find: jest.fn().mockResolvedValue([myDevice]),
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
      myDevice = await controller.bind(rawDevices);
      expect(myDevice.id).toBeDefined;
      expect(myDevice.createdTime).toBeDefined;
    });
  });

  describe('update', () => {
    it('should return a devices', async () => {
      const newDevice = { ...myDevice, alias: 'lounge' };
      const device = await controller.update(newDevice);
      expect(device.alias).toBe('lounge');
    });
  });

  describe('findAllWithUserId', () => {
    it("Should return all of user's devices", async () => {
      const deviceArray = await controller.findAllWithUserId(ownerUserId);
      expect(Array.isArray(deviceArray)).toBe(true);
    });
  });

  describe('unbind', () => {
    it('should return a devices', async () => {
      const result = await controller.unbind(1);
      expect(result).toBe(true);
    });
  });
});
