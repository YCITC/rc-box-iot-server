import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevicesService } from './devices.service';
import { Device } from './entities/device.entity';

describe('DevicesService', () => {
  let service: DevicesService;
  let repo: Repository<Device>;
  let myDevice: Device;
  const ownerUserId = 1;
  const rawDevices = {
    deviceId: 'rc-box-v1-a12301',
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
      expect(myDevice.id).toBeDefined;
      expect(myDevice.createdTime).toBeDefined;
      expect(repoSpy).toBeCalledWith(myDevice);
    });
  });

  describe('update', () => {
    it('should return a devices', async () => {
      const repoSpy = jest.spyOn(repo, 'update');
      const newDevice = { ...myDevice, alias: 'lounge' };
      const device = await service.update(newDevice);
      expect(device.alias).toBe('lounge');
      expect(repoSpy).toBeCalledWith(newDevice.id, { alias: 'lounge' });
    });
  });

  describe('findAllWithUserId', () => {
    it("Should return all of user's devices", async () => {
      const repoSpy = jest.spyOn(repo, 'find');
      const deviceArray = await service.findAllWithUserId(ownerUserId);
      expect(Array.isArray(deviceArray)).toBe(true);
      expect(repoSpy).toBeCalledWith({
        order: { id: 'DESC' },
        where: { ownerUserId: ownerUserId },
      });
    });
  });

  describe('unbind', () => {
    it('should return a devices', async () => {
      const repoSpy = jest.spyOn(repo, 'delete');
      const result = await service.unbind(1);
      expect(result).toBe(true);
      expect(repoSpy).toBeCalledWith({ id: 1 });
    });
  });
});
