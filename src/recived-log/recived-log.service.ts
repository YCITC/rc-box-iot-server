import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ReceivedLogInterface from './interface/recived_log.interface';
import ReceivedLogDto from './dto/recived-log.dto';
import ReceivedLog from './entity/recived-log.entity';

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
