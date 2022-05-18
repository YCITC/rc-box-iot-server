import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReceivedLog } from './recived_log.entity';

@Injectable()
export class ReceivedLogService {
  constructor(
    @InjectRepository(ReceivedLog)
    private receivedLogRepository: Repository<ReceivedLog>,
  ) {}

  findAll(): Promise<ReceivedLog[]> {
    return this.receivedLogRepository.find();
  }

  // findOne(id: number): Promise<ReceivedLog> {
  //   return this.receivedLogRepository.findOne(id);
  // }

  async remove(id: number): Promise<void> {
    await this.receivedLogRepository.delete(id);
  }
}
