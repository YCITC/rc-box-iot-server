import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReceivedLog } from './recived_log.entity';
import { ReceivedLogInterface } from '../interfaces/recived_log.interface'

@Injectable()
export class ReceivedLogService {
  constructor(
    // @InjectRepository(ReceivedLog)
    // private receivedLogRepository: Repository<ReceivedLog>,
  ) {}
  private logs: ReceivedLogInterface[] = [];

  // findAll(): Promise<ReceivedLog[]> {
    // return "this.receivedLogRepository.find()";
  // }
  findAll(): ReceivedLogInterface[] {
    return this.logs;
  }

  findByDeviceId(deviceId: string): ReceivedLogInterface[] {
    // let finded: ReceivedLogInterface[] = [];
    // return finded;
    return this.logs.filter(log=>log.device_id == deviceId);
  }

  add(obj: ReceivedLogInterface) {
  // findOne(id: number): Promise<ReceivedLog> {
    // return this.receivedLogRepository.findOne(id);
    console.log('this.logs: ', this.logs);
    console.log('input obj: ', obj);
    this.logs.push(obj);
  }

  // async remove(id: number): Promise<void> {
  //   await this.receivedLogRepository.delete(id);
  // }
}
