import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import DeviceDto from './dto/device.dto';
import Device from './entities/device.entity';

@Injectable()
export default class DevicesService {
  constructor(
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
  ) {}

  findByOneDeviceId(deviceId: string): Promise<Device> {
    return this.devicesRepository.findOneBy({ deviceId });
  }

  async bind(deviceDto: DeviceDto): Promise<Device> {
    return this.devicesRepository.save(deviceDto);
  }

  async update(deviceDto: DeviceDto): Promise<Device> {
    await this.devicesRepository.update(deviceDto.deviceId, {
      alias: deviceDto.alias,
    });
    return this.devicesRepository.findOneBy({ deviceId: deviceDto.deviceId });
  }

  async checkDeviceWithUser(userId, deviceId): Promise<boolean> {
    const device = await this.devicesRepository.findOneBy({ deviceId });
    if (device.ownerUserId === userId) return Promise.resolve(true);
    return Promise.resolve(false);
  }

  async findAllWithUserId(ownerUserId: number) {
    return this.devicesRepository.find({
      order: {
        createdTime: 'DESC',
      },
      where: { ownerUserId },
    });
  }

  async unbind(deviceId: string): Promise<boolean> {
    const response = await this.devicesRepository.delete({
      deviceId,
    });
    if (response.affected === 1) {
      return Promise.resolve(true);
    }
    throw new BadRequestException('device not found');
  }
}
