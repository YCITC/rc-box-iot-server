import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
  IPaginationMeta,
} from 'nestjs-typeorm-paginate';

import {
  ReceivedLogInterface,
  ReceivedLogsInterface,
} from './interface/recived-log.interface';
import ReceivedLogDto from './dto/recived-log.dto';
import ReceivedLog from './entity/recived-log.entity';
import GetByUserIdDto from './dto/get-by-user-id.dto';

@Injectable()
export default class ReceivedLogService {
  constructor(
    @InjectRepository(ReceivedLog)
    private receivedLogRepository: Repository<ReceivedLog>,
  ) {}

  private logs: ReceivedLogInterface[] = [];

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

  async getByUserId(dto: GetByUserIdDto): Promise<ReceivedLogsInterface> {
    const queryBuilder = this.receivedLogRepository
      .createQueryBuilder('received_log')
      .innerJoin('devices', 'devices')
      .where('devices.ownerUserId = :userId', { userId: dto.userId })
      .andWhere('devices.deviceId = received_log.deviceId')
      .orderBy('received_log.id', 'DESC');
    // return queryBuilder.getMany();
    const results = await paginate(queryBuilder, dto.paginateOptions);
    return results;
  }

  async add(receivedLogDto: ReceivedLogDto): Promise<ReceivedLog> {
    const log = new ReceivedLog(receivedLogDto.deviceId, new Date());
    return this.receivedLogRepository.save(log);
  }

  async clean(deviceId: string): Promise<any> {
    const response = await this.receivedLogRepository.delete({ deviceId });
    /*
     * response like this
     * DeleteResult { raw: [], affected: 1 }
     */
    if (response.affected !== 0) {
      return Promise.resolve(true);
    }
    throw new BadRequestException('User not found');
  }
}
