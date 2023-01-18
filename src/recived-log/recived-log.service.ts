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
    const log = new ReceivedLog();
    log.time = new Date();
    log.deviceId = receivedLogDto.deviceId;
    return this.receivedLogRepository.save(log);
  }

  // findByDevice(deviceId: string): Promise<ReceivedLog> {

  //   return this.receivedLogRepository.findBy({deviceId: deviceId});
  //   // return this.logs.filter(log=>log.deviceId == deviceId);
  // }
  //

  // findOne(id: string): Promise<User> {
  // findByDeviceId_V2(deviceId: string): Promise<ReceivedLog> {
  //   return this.receivedLogRepository.findBy({'deviceId': deviceId});
  // }

  // async add_v2(obj: ReceivedLogInterface) :Promise<ReceivedLog> {
  //   console.log('this.logs: ', this.logs);
  //   console.log('input obj: ', obj);
  //   return await this.receivedLogRepository.save<ReceivedLog>(obj);
  //   // return await this.receivedLogRepository.create<ReceivedLog>(obj);
  // }
  // public async create(users: ReceivedLogInterface): Promise<Users> {
  //   return await this.receivedLogRepository.create<Users>(users);
  // }

  // async remove(id: number): Promise<void> {
  //   await this.receivedLogRepository.delete(id);
  // }
}
