import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';

import { ReceivedLogsInterface } from './interface/recived-log.interface';
import ReceivedLogDto from './dto/recived-log.dto';
import ReceivedLog from './entity/recived-log.entity';
import GetByUserDto from './dto/get-by-user.dto';

@Injectable()
export default class ReceivedLogService {
  constructor(
    @InjectRepository(ReceivedLog)
    private receivedLogRepository: Repository<ReceivedLog>,
  ) {}

  async getAll(): Promise<ReceivedLog[]> {
    return this.receivedLogRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async findByDeviceId(deviceId: string): Promise<ReceivedLog[]> {
    return this.receivedLogRepository.find({
      order: {
        id: 'DESC',
      },
      where: { deviceId },
    });
  }

  async getByUser(dto: GetByUserDto): Promise<ReceivedLogsInterface> {
    const queryBuilder = this.receivedLogRepository
      .createQueryBuilder('received_log')
      .innerJoin('devices', 'devices')
      .where('devices.ownerUserId = :userId', { userId: dto.userId })
      .andWhere('devices.deviceId = received_log.deviceId')
      .orderBy('received_log.id', 'DESC');
    return paginate(queryBuilder, dto.paginateOptions);
  }

  async add(receivedLogDto: ReceivedLogDto): Promise<ReceivedLog> {
    const log = new ReceivedLog(receivedLogDto.deviceId, new Date());
    return this.receivedLogRepository.save(log);
  }

  async clean(deviceId: string): Promise<boolean> {
    await this.receivedLogRepository.delete({ deviceId });
    /*
     * receivedLogRepository.delete
     * response like this
     * DeleteResult { raw: [], affected: 1 }
     */
    return Promise.resolve(true);
  }
}
