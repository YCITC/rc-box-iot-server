import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BindDeviceDto } from './dto/bind-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './entities/device.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
  ) {}
  async bind(BindDeviceDto: BindDeviceDto): Promise<Device> {
    try {
      const device = await this.devicesRepository.save(BindDeviceDto);
      return Promise.resolve(device);
    } catch (error) {
      if (error.sqlMessage.indexOf('Duplicate entry') > -1) {
        const deviceId = BindDeviceDto.deviceId;
        throw new BadRequestException(
          `The device [${deviceId}] has already been bound`,
        );
      }
    }
  }

  async update(updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    await this.devicesRepository
      .update(updateDeviceDto.id, {
        alias: updateDeviceDto.alias,
      })
      .then((response) => {
        response.affected == 1;
        // console.log(response.affected == 1);
      });
    return this.devicesRepository.findOneBy({ id: updateDeviceDto.id });
  }

  async findAllWithUserId(ownerUserId: number) {
    return this.devicesRepository.find({
      order: {
        id: 'DESC',
      },
      where: { ownerUserId },
    });
  }

  async unbind(id: number): Promise<boolean> {
    const response = await this.devicesRepository.delete({ id });
    if (response.affected == 1) {
      return Promise.resolve(true);
    }
    throw new BadRequestException('device not found');
  }
}
