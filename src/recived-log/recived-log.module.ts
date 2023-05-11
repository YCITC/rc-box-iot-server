import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivedLog } from './entity/recived-log.entity';
import { ReceivedLogService } from './recived-log.service';
import { ReceivedLogController } from './recived-log.controller';
import { DevicesService } from '../devices/devices.service';
import { DevicesModule } from '../devices/devices.module';
import { Device } from '../devices/entities/device.entity';

@Module({
  imports: [DevicesModule, TypeOrmModule.forFeature([ReceivedLog, Device])],
  exports: [TypeOrmModule],
  controllers: [ReceivedLogController],
  providers: [ReceivedLogService, DevicesService],
})
export class ReceivedLogModule {}
