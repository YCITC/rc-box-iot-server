
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivedLog } from './recived_log.entity';
import { ReceivedLogService } from './recived-log.service';
import { ReceivedLogController } from './recived_log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReceivedLog])],
  exports: [TypeOrmModule],
  controllers: [ReceivedLogController],
  providers: [ReceivedLogService],
})
export class ReceivedLogModule {}
