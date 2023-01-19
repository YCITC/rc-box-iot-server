import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReceivedLogInterface } from './interface/recived_log.interface';
import { ReceivedLogDto } from './dto/recived-log.dto';
import { ReceivedLog } from './entity/recived-log.entity';

@Injectable()
export class ReceivedLogService {
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

  async create(receivedLogDto: ReceivedLogDto): Promise<ReceivedLog> {
    const log = new ReceivedLog(receivedLogDto.deviceId, new Date());
    return this.receivedLogRepository.save(log);
  }
}
