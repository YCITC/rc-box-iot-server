import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevicesService } from './devices.service';
import { Device } from './entities/device.entity';

describe('DevicesService', () => {
  let service: DevicesService;
  let repo: Repository<Device>;
  let myDevice: Device;
  let mockDeviceInDB: Device;
  const ownerUserId = 1;
  const rawDevices = {
    deviceId: 'rc-box-test-12301',
    ownerUserId: ownerUserId,
    alias: 'tsutaya',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: getRepositoryToken(Device),
          useValue: {
            save: (device) => {
              device.id = 1;
              device.createdTime = new Date();
              mockDeviceInDB = { ...device };
              return Promise.resolve(device);
            },
            update: jest.fn().mockImplementation((deviceId, obj) => {
              mockDeviceInDB.alias = obj.alias;
              return Promise.resolve({ raw: [], affected: 1 });
            }),
            findOneBy: jest.fn().mockResolvedValue(mockDeviceInDB),
            find: jest.fn().mockResolvedValue([myDevice]),
            delete: jest.fn().mockResolvedValue({ raw: [], affected: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
    repo = module.get<Repository<Device>>(getRepositoryToken(Device));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bind', () => {
    it('should return a devices', async () => {
      const repoSpy = jest.spyOn(repo, 'save');
      myDevice = await service.bind(rawDevices);
      expect(myDevice.createdTime).toBeDefined;
      expect(repoSpy).toBeCalledWith(myDevice);
    });
  });

  describe('findByOneDeviceId', () => {
    it('should return a devices', async () => {
      myDevice = await service.findByOneDeviceId(rawDevices.deviceId);
      expect(myDevice.createdTime).toBeDefined;
    });
  });

  describe('update', () => {
    it('should return a devices', async () => {
      const repoSpy = jest.spyOn(repo, 'update');
      const newDevice = { ...myDevice, alias: 'lounge' };
      const device = await service.update(newDevice);
      expect(device.alias).toBe('lounge');
      expect(repoSpy).toBeCalledWith(newDevice.deviceId, { alias: 'lounge' });
    });
  });

  describe('checkDeviceWithUser', () => {
    it('should return boolean', async () => {
      const result = await service.checkDeviceWithUser(ownerUserId, myDevice);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('findAllWithUserId', () => {
    it("Should return all of user's devices", async () => {
      const repoSpy = jest.spyOn(repo, 'find');
      const deviceArray = await service.findAllWithUserId(ownerUserId);
      expect(Array.isArray(deviceArray)).toBe(true);
      expect(repoSpy).toBeCalledWith({
        order: { createdTime: 'DESC' },
        where: { ownerUserId: ownerUserId },
      });
    });
  });

  describe('unbind', () => {
    it('should return boolean', async () => {
      const repoSpy = jest.spyOn(repo, 'delete');
      const result = await service.unbind(rawDevices.deviceId);
      expect(typeof result).toBe('boolean');
      expect(repoSpy).toBeCalledWith({ deviceId: rawDevices.deviceId });
    });
  });
});
